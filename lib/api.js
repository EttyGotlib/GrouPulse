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

  // 1. שליפת הקבוצות של המנחה
  const { data: groups, error: groupsError } = await supabase
      .from('Groups')
      .select('*')
      .eq('moderator_id', user.id);

  if (groupsError) throw groupsError;

  // 2. שליפת כל המשתתפים (לצורך ספירה)
  const { data: participants, error: participantsError } = await supabase
      .from('Participants')
      .select('group_id');
  
  if (participantsError) throw participantsError;

  // 3. שליפת תיעודים קיימים מטבלת Sessions
  // שימי לב: השתמשתי ב-session_number בדיוק כמו בצילום המסך שלך
  const { data: existingSessions, error: sessionsError } = await supabase
      .from('Sessions')
      .select('group_id, session_number');

  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);

  let weeklyMeetings = 0;
  let missingNotes = 0;

  const groupsWithCount = groups.map(group => {
      const count = participants.filter(p => p.group_id === group.id).length;
      const startDate = new Date(group.start_date);
      const totalPlanned = group.session_count || 10;

      for (let i = 0; i < totalPlanned; i++) {
          const sessionDate = new Date(startDate);
          sessionDate.setDate(startDate.getDate() + (i * 7));
          const sessionNum = i + 1;

          // האם המפגש מתוכנן לשבוע הקרוב?
          if (sessionDate >= now && sessionDate <= nextWeek) {
              weeklyMeetings++;
          }

          // האם המפגש כבר היה ואין לו שורה בטבלת Sessions?
          if (sessionDate < now) {
              const hasNote = existingSessions?.some(
                  s => s.group_id === group.id && s.session_number === sessionNum
              );
              if (!hasNote) {
                  missingNotes++;
              }
          }
      }

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
      weeklyMeetings: weeklyMeetings,
      missingNotes: missingNotes
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