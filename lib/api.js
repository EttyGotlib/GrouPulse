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
    // אנחנו משתמשים ב-return במקום ב-throw כדי למנוע קריסה של ה-UI
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      // כאן היה ה-throw שגרם למסך האדום. עכשיו זה פשוט מחזיר הודעה.
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
    // השתמשי בהדפסה רגילה במקום ב-console.error אם את רוצה שקט מוחלט ב-Dev
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