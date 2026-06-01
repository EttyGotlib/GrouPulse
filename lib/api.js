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
          session_count: groupData.session_count,
          meeting_time: groupData.meeting_time
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
 * פונקציה לדאשבורד
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
  const { data: existingSessions, error: sessionsError } = await supabase
      .from('Sessions')
      .select('group_id, session_number');

  const now = new Date();


  const endOfThisWeek = new Date(now);
  const daysUntilSaturday = 6 - now.getDay(); 
  endOfThisWeek.setDate(now.getDate() + daysUntilSaturday);
  endOfThisWeek.setHours(23, 59, 59, 999);

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

          if (sessionDate >= now && sessionDate <= endOfThisWeek) {
              weeklyMeetings++;
          }

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
        const formattedTime = group.meeting_time 
          ? group.meeting_time.substring(0, 5) 
          : "16:00";

        allSessions.push({
          id: group.id,
          num: (i + 1).toString(), // מספר המפגש
          group: group.name,
          time: formattedTime, 
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
/**
 * שליפת סיכום מפגש כללי (מדדים וטקסט) לפי קבוצה ומספר מפגש
 */
export const getSessionSummary = async (groupId, sessionNum) => {
  try {
    const { data, error } = await supabase
      .from('Sessions')
      .select('*')
      .eq('group_id', groupId)
      .eq('session_number', parseInt(sessionNum))
      .maybeSingle(); 

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching session summary:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * שליפת התיעודים והמדדים הפרטניים של התלמידים עבור מפגש ספציפי
 */
export const getIndividualNotesBySession = async (groupId, sessionNum) => {
  try {
    const { data, error } = await supabase
      .from('Individual_Notes')
      .select('*')
      .eq('group_id', groupId)
      .eq('session_id', sessionNum); 

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching individual notes:', error.message);
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

/**
 * פונקציה לשליפת פרטי המשתמש המחובר
 */
export const getCurrentUserInfo = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;

    if (user) {
      return {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          // שליפת השם מתוך ה-user_metadata (שם הוא נשמר בדרך כלל ב-Supabase)
          fullName: user.user_metadata?.full_name || user.user_metadata?.name || "מנחה",
          role: user.user_metadata?.role || "מנחה קבוצות"
        }
      };
    }
    return { success: false, error: "לא נמצא משתמש מחובר" };
  } catch (error) {
    console.error('Error fetching user info:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * פונקציה לעדכון פרטי המשתמש
 */
export const updateUserInfo = async (updatedData) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: { 
        full_name: updatedData.fullName,
        role: updatedData.title 
      }
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating user info:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * פונקציה לאימות סיסמה נוכחית ועדכון לסיסמה חדשה
 */
export const verifyAndUpdatePassword = async (currentPassword, newPassword) => {
  try {
    // 1. קבלת פרטי המשתמש המחובר
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: "לא נמצא משתמש מחובר" };
    }

    // 2. אימות מול Supabase באמצעות כניסה מחדש
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      return { success: false, error: "הסיסמה הנוכחית שהוקלדה אינה נכונה" };
    }

    // 3. עדכון הסיסמה החדשה
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // אם הכל עבר בשלום
    return { success: true };

  } catch (error) {
    // catch כללי למקרה של בעיית רשת או שגיאה בלתי צפויה
    console.log('Password update caught error:', error.message);
    return { success: false, error: "ארעה שגיאה בתקשורת עם השרת" };
  }
};

/**
 * פונקציה להתנתקות מהמערכת
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error.message);
    return { success: false, error: error.message };
  }
};


// 1. פונקציה לבדיקת התפקיד של המשתמש המחובר מתוך טבלת הפרופילים
export const getUserRole = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('Profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data?.role; // יחזיר 'institution' או 'moderator'
  } catch (error) {
    console.error('Error fetching user role:', error.message);
    return null;
  }
};

// 2. פונקציה לשליפת הנתונים המרוכזים עבור דף הבית של המוסד
export const getInstituteDashboardData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");

    // שליפת כל הקבוצות שמשויכות למוסד זה
    const { data: groups, error: groupsError } = await supabase
      .from('Groups')
      .select('*')
      .eq('institute_id', user.id); 

    if (groupsError) throw groupsError;

    // שליפת סך כל המטופלים במערכת לצורך הסטטיסטיקה במלבנים העליונים
    const { data: participants, error: partError } = await supabase
      .from('Participants')
      .select('id');
    
    if (partError) throw partError;

    return {
      success: true,
      data: {
        groups: groups || [],
        stats: {
          totalParticipants: participants?.length || 0,
          activeGroups: groups?.length || 0
        }
      }
    };
  } catch (error) {
    console.error('Institute API Error:', error.message);
    return { success: false, error: error.message };
  }
};

export const getModeratorsByInstitute = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");

    // שליפת המנחים ששדה ה-institution_id שלהם שווה ל-ID של המוסד המחובר
    const { data: moderators, error: modsError } = await supabase
      .from('Profiles')
      .select('*')
      .eq('role', 'moderator')
      .eq('institution_id', user.id); // משווה ישירות ל-ID של המוסד המחובר

    if (modsError) throw modsError;
    return { success: true, data: moderators || [] };
  } catch (error) {
    console.error('Error fetching moderators:', error.message);
    return { success: false, error: error.message };
  }
};

// ==========================================================
// פונקציות חדשות שנוספו במיוחד עבור דשבורד המוסד בזמן אמת
// ==========================================================

/**
 * 1. פונקציה לשליפת שם המוסד הנוכחי מטבלת Profiles
 */
export const getRealInstitutionName = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "משתמש לא מחובר" };

    const { data, error } = await supabase
      .from('Profiles')
      .select('display_name')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return { success: true, name: data?.display_name || "מוסד ללא שם" };
  } catch (error) {
    console.error('Error fetching institution name:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * 2. פונקציה מקיפה לשליפת כל הקבוצות האמיתיות של מנחי המוסד (כולל סטטיסטיקה)
 */
export const getRealInstituteDashboardRealData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "משתמש לא מחובר" };

    // א'. שלוף את כל המנחים השייכים למוסד זה
    const { data: moderators, error: modsError } = await supabase
      .from('Profiles')
      .select('id')
      .eq('role', 'moderator')
      .eq('institution_id', user.id);

    if (modsError) throw modsError;
    const moderatorIds = moderators?.map(m => m.id) || [];

    if (moderatorIds.length === 0) {
      return { success: true, data: { groups: [], stats: { totalParticipants: 0, activeGroups: 0 } } };
    }

    // ב'. שלוף את כל הקבוצות ששייכות למנחים האלו
    const { data: groups, error: groupsError } = await supabase
      .from('Groups')
      .select('*')
      .in('moderator_id', moderatorIds);

    if (groupsError) throw groupsError;
    const groupIds = groups?.map(g => g.id) || [];

    // ג'. שלוף את כל המשתתפים המשויכים לקבוצות הללו לצורך ספירה מדויקת
    if (groupIds.length === 0) {
      return { success: true, data: { groups: groups || [], stats: { totalParticipants: 0, activeGroups: groups?.length || 0 } } };
    }

    const { data: participants, error: partError } = await supabase
      .from('Participants')
      .select('group_id')
      .in('group_id', groupIds);

    if (partError) throw partError;

    // ד'. הוספת שדה כמות משתתפים לכל קבוצה בזמן אמת
    const groupsWithCount = groups.map(group => {
      const count = participants?.filter(p => p.group_id === group.id).length || 0;
      return {
        ...group,
        participants_count: count
      };
    });

    return {
      success: true,
      data: {
        groups: groupsWithCount,
        stats: {
          totalParticipants: participants?.length || 0,
          activeGroups: groups?.length || 0
        }
      }
    };
  } catch (error) {
    console.error('Error loading real institute data:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * 3. פונקציה לשליפת כל המטופלים האמיתיים של כל קבוצות המוסד
 */
export const getRealInstituteParticipants = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "משתמש לא מחובר" };

    // א'. שלוף את מנחי המוסד
    const { data: moderators } = await supabase
      .from('Profiles')
      .select('id')
      .eq('role', 'moderator')
      .eq('institution_id', user.id);

    const moderatorIds = moderators?.map(m => m.id) || [];
    if (moderatorIds.length === 0) return { success: true, data: [] };

    // ב'. שלוף את קבוצות המנחים
    const { data: groups } = await supabase
      .from('Groups')
      .select('id, name')
      .in('moderator_id', moderatorIds);

    const groupIds = groups?.map(g => g.id) || [];
    if (groupIds.length === 0) return { success: true, data: [] };

    // ג'. שלוף את כל המטופלים בתוך הקבוצות האלו
    const { data: participants, error: partError } = await supabase
      .from('Participants')
      .select('*')
      .in('group_id', groupIds);

    if (partError) throw partError;

    // ד'. הצמדת שם הקבוצה לכל מטופל בשביל התצוגה במאגר
    const participantsWithGroupName = participants.map(p => {
      const groupObj = groups.find(g => g.id === p.group_id);
      return {
        ...p,
        group_name: groupObj ? groupObj.name : 'קבוצה כללית'
      };
    });

    return { success: true, data: participantsWithGroupName };
  } catch (error) {
    console.error('Error fetching real participants:', error.message);
    return { success: false, error: error.message };
  }
};