import { supabase } from './supabase';

/**
 * פונקציה ליצירת קבוצה חדשה
 */
export const createNewGroup = async (groupData, participantsList) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: group, error: groupError } = await supabase
        .from('Groups')
        .insert([{
          name: groupData.name,
          description: groupData.type, 
          moderator_id: user?.id,
          start_date: groupData.start_date,     
          meeting_day: groupData.meeting_day,   
          location_notes: groupData.location_notes, 
          session_count: groupData.session_count
        }])
        .select()
        .single();
  
      if (groupError) throw groupError;
  
      if (participantsList && participantsList.length > 0) {
        const toInsert = participantsList.map(p => ({
          name_or_code: p.fullName, 
          group_id: group.id, 
          email: p.email,             
          identity_number: p.idNumber,  
          notes: ""                   
        }));
  
        const { error: partError } = await supabase
          .from('Participants')
          .insert(toInsert);
  
        if (partError) throw partError;
      }
  
      return { success: true, data: group };
    } catch (error) {
      console.error('API Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  /**
 * פונקציה להוספת משתתף בודד לקבוצה קיימת
 */
export const addSingleParticipant = async (groupId, participantData) => {
  try {
    const { data, error } = await supabase
      .from('Participants') 
      .insert([
        {
          name_or_code: participantData.fullName || participantData.name,
          group_id: groupId,
          email: participantData.email,
          identity_number: participantData.idNumber || participantData.identity_number,
          notes: participantData.notes || ""
        }
      ]);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error adding participant:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * פונקציה לדאשבורד )
 */
export const getDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");

    const { data: groups, error: groupsError } = await supabase
        .from('Groups')
        .select('*')
        .eq('moderator_id', user.id);

    if (groupsError) throw groupsError;

    const { data: participants, error: participantsError } = await supabase
        .from('Participants')
        .select('group_id');
    
    if (participantsError) throw participantsError;

    const groupsWithCount = groups.map(group => {
        const count = participants.filter(p => p.group_id === group.id).length;
        return {
            ...group,
            participants_count: count
        };
    });

    const stats = {
        activeGroups: groupsWithCount.length,
        totalParticipants: participants.reduce((acc, curr) => {
            return acc + (groups.some(g => g.id === curr.group_id) ? 1 : 0);
        }, 0),
        weeklyMeetings: 0,
        missingNotes: 0
    };

    return { groups: groupsWithCount, stats };
};

export const getGroupDetails = async (groupId) => {
    if (!groupId) return { success: false, error: "No Group ID provided" };

    try {
      const { data: group, error: groupError } = await supabase
        .from('Groups')
        .select('*')
        .eq('id', groupId)
        .single();
  
      if (groupError) throw groupError;
  
      const { data: participants, error: partError } = await supabase
        .from('Participants')
        .select('*')
        .eq('group_id', groupId);
  
      if (partError) throw partError;
  
      return { 
        success: true, 
        group, 
        participants 
      };
    } catch (error) {
      console.error('Error fetching group details:', error.message);
      return { success: false, error: error.message };
    }
    
}
/**
 * פונקציה לשליפת כל המפגשים המחושבים של המנחה
 */
export const getAllModeratorSessions = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "משתמש לא מחובר" };

    // שליפת כל הקבוצות שהמנחה הזה מנהל
    const { data: groups, error } = await supabase
      .from('Groups')
      .select('*')
      .eq('moderator_id', user.id);

    if (error) throw error;

    let allSessions = [];

    // חישוב המפגשים עבור כל קבוצה
    groups.forEach(group => {
      const startDate = new Date(group.start_date);
      const count = group.session_count || 10; // ברירת מחדל אם לא הוגדר

      for (let i = 0; i < count; i++) {
        const sessionDate = new Date(startDate);
        // הוספת i שבועות לתאריך ההתחלה
        sessionDate.setDate(startDate.getDate() + (i * 7));

        allSessions.push({
          id: group.id,
          num: (i + 1).toString(), // מספר המפגש
          group: group.name,
          time: "16:00", // אפשר להוסיף שדה שעה בטבלה בעתיד
          location: group.location_notes || "לא הוגדר מיקום",
          date: sessionDate.toDateString(), // למטרת השוואה ביומן
          fullDate: sessionDate
        });
      }
    });

    return { success: true, data: allSessions };
  } catch (error) {
    console.error('Error fetching sessions:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * שמירת תיעוד פרטני (נוכחות וציונים) לכל משתתף
 */

export const saveIndividualNotes = async (groupId, sessionNum, attendanceList) => {
  try {
    // מכינים את הנתונים רק עבור אלו שסומנו כנוכחים
    const notesToUpsert = attendanceList
      .filter(p => p.present)
      .map(p => ({
        participant_id: p.id,
        group_id: groupId,
        session_id: sessionNum, 
        content: p.notes || "",
        participation_score: p.participationLevel || 0
      }));

    if (notesToUpsert.length === 0) return { success: true, message: "No participants present" };

    const { data, error } = await supabase
      .from('Individual_Notes')
      .upsert(notesToUpsert, { 
        onConflict: 'participant_id, group_id, session_id' 
      });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error saving individual notes:', error.message);
    return { success: false, error: error.message };
  }
};
/**
 * שמירת סיכום מפגש כללי ומדדים קבוצתיים
 */
export const saveSessionSummary = async (groupId, sessionNum, summaryData) => {
  try {
    const { data, error } = await supabase
      .from('Sessions')
      .upsert({
        group_id: groupId,
        session_number: parseInt(sessionNum), 
        summary: summaryData.logText,
        cohesion: summaryData.cohesion,
        engagement: summaryData.engagement,
        atmosphere: summaryData.atmosphere,
        date: new Date().toISOString()
      }, { 
        onConflict: 'group_id, session_number' 
      });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error saving session summary:', error.message);
    return { success: false, error: error.message };
  }
};
export const getParticipantProgress = async (participantId) => {
  try {
    const { data, error } = await supabase
      .from('Individual_Notes')
      .select(`
        *,
        Participants (
          name_or_code
        )
      `)
      .eq('participant_id', participantId)
      .order('session_id', { ascending: true }); 

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching participant progress:', error.message);
    return { success: false, error: error.message };
  }
};