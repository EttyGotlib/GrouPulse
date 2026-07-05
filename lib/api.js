/**
 * @fileoverview GrouPulse API service layer handling Supabase database operations.
 */

import { supabase } from './supabase';

// 1. SYSTEM, PROFILE & AUTHENTICATION SERVICES
/**
 * Fetches the authenticated user's account details and metadata profile.
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
 * Updates the profile metadata (name and role) of the authenticated user.
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
 * Validates the current password and updates it to a new one for the logged-in user.
 */
export const verifyAndUpdatePassword = async (currentPassword, newPassword) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: "לא נמצא משתמש מחובר" };
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (signInError) {
      return { success: false, error: "הסיסמה הנוכחית שהוקלדה אינה נכונה" };
    }
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (updateError) {
      return { success: false, error: updateError.message };
    }
    return { success: true };

  } catch (error) {
    console.log('Password update caught error:', error.message);
    return { success: false, error: "ארעה שגיאה בתקשורת עם השרת" };
  }
};
/**
 * Signs out the current user and clears the active session.
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
/**
 * Fetches the role configuration for a specific user ID from the profiles table.
 */
export const getUserRole = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('Profiles')
      .select('role')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data?.role; 
  } catch (error) {
    console.error('Error fetching user role:', error.message);
    return null;
  }
};
// 2. MODERATOR INTERFACE SERVICES
/**
 * Creates a new group and associates an initial list of participants.
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
 * Adds a single participant to a specific group.
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
 * Fetches dashboard statistics and active groups for the logged-in moderator.
 */
export const getDashboardData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");
    const { data: groups, error: groupsError } = await supabase
      .from('Groups')
      .select(`
        *,
        Participants(count)
      `)
      .eq('moderator_id', user.id); 
    if (groupsError) throw groupsError;
    
    const groupIds = groups.map(g => g.id);
    const { data: existingSessions, error: sessionsError } = await supabase
        .from('Sessions')
        .select('group_id, session_number')
        .in('group_id', groupIds); 
    if (sessionsError) throw sessionsError;

    const now = new Date();
    const endOfThisWeek = new Date(now);
    const daysUntilSaturday = 6 - now.getDay(); 
    endOfThisWeek.setDate(now.getDate() + daysUntilSaturday);
    endOfThisWeek.setHours(23, 59, 59, 999);
    let weeklyMeetings = 0;
    let missingNotes = 0;
    
    const groupsWithCount = groups.map(group => {
        const count = group.Participants?.[0]?.count || 0;
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
        totalParticipants: groupsWithCount.reduce((acc, curr) => acc + (curr.participants_count || 0), 0),
        weeklyMeetings: weeklyMeetings,
        missingNotes: missingNotes
    };
    return { groups: groupsWithCount, stats };
  } catch (error) {
    console.error('Error fetching dashboard data:', error.message);
    return { groups: [], stats: { activeGroups: 0, totalParticipants: 0, weeklyMeetings: 0, missingNotes: 0 } };
  }
};
/**
 * Retrieves core details and the participant list for a specific group.
 */
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
 * Generates a complete schedule of all sessions across all groups for the current moderator.
 */
export const getAllModeratorSessions = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "משתמש לא מחובר" };
    const { data: groups, error } = await supabase
      .from('Groups')
      .select('*')
      .eq('moderator_id', user.id);
    if (error) throw error;
    let allSessions = [];
    groups.forEach(group => {
      const startDate = new Date(group.start_date);
      const count = group.session_count || 10; 

      for (let i = 0; i < count; i++) {
        const sessionDate = new Date(startDate);
        sessionDate.setDate(startDate.getDate() + (i * 7));
        const formattedTime = group.meeting_time 
          ? group.meeting_time.substring(0, 5) 
          : "16:00";
        allSessions.push({
          id: group.id,
          num: (i + 1).toString(), 
          group: group.name,
          time: formattedTime, 
          location: group.location_notes || "לא הוגדר מיקום",
          date: sessionDate.toDateString(), 
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
 * Saves or updates professional observation notes for attending participants.
 */
export const saveIndividualNotes = async (groupId, sessionNum, attendanceList) => {
  try {
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
 * Saves or updates the overall summary and metrics for a specific session.
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
 * Retrieves the summary data for a specific group session.
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
 * Retrieves all individual participant notes recorded for a specific session.
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
/**
 * Retrieves the historical progress and timeline notes for a specific participant.
 */
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
// 3. INSTITUTION INTERFACE SERVICES
/**
 * Fetches groups and basic statistics for the logged-in institution.
 */
export const getInstituteDashboardData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");
    const { data: groups, error: groupsError } = await supabase
      .from('Groups')
      .select('*')
      .eq('institute_id', user.id); 
    if (groupsError) throw groupsError;
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
/**
 * Retrieves all moderators registered under the logged-in institution.
 */
export const getModeratorsByInstitute = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");
    const { data: moderators, error: modsError } = await supabase
      .from('Profiles')
      .select('*')
      .eq('role', 'moderator')
      .eq('institution_id', user.id); 
    if (modsError) throw modsError;
    return { success: true, data: moderators || [] };
  } catch (error) {
    console.error('Error fetching moderators:', error.message);
    return { success: false, error: error.message };
  }
};
/**
 * Retrieves the official registered name of the authenticated institution/profile.
 */
export const getRealInstitutionName = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "משתמש לא מחובר" };

    const { data, error } = await supabase
      .from('Profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();
    if (error) throw error;
    return { success: true, name: data?.full_name || "מוסד ללא שם" };
  } catch (error) {
    console.error('Error fetching institution name:', error.message);
    return { success: false, error: error.message };
  }
};
/**
 *  Fetches comprehensive dashboard data including aggregated participant counts.
 */
export const getRealInstituteDashboardRealData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "משתמש לא מחובר" };
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
    const { data: groups, error: groupsError } = await supabase
      .from('Groups')
      .select('*')
      .in('moderator_id', moderatorIds);

    if (groupsError) throw groupsError;
    const groupIds = groups?.map(g => g.id) || [];
    if (groupIds.length === 0) {
      return { success: true, data: { groups: groups || [], stats: { totalParticipants: 0, activeGroups: groups?.length || 0 } } };
    }
    const { data: participants, error: partError } = await supabase
      .from('Participants')
      .select('group_id')
      .in('group_id', groupIds);

    if (partError) throw partError;
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
 * Retrieves all participants across all groups managed by the institution's moderators.
 */
export const getRealInstituteParticipants = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "משתמש לא מחובר" };
    const { data: moderators } = await supabase
      .from('Profiles')
      .select('id')
      .eq('role', 'moderator')
      .eq('institution_id', user.id);
    const moderatorIds = moderators?.map(m => m.id) || [];
    if (moderatorIds.length === 0) return { success: true, data: [] };
    const { data: groups } = await supabase
      .from('Groups')
      .select('id, name')
      .in('moderator_id', moderatorIds);
    const groupIds = groups?.map(g => g.id) || [];
    if (groupIds.length === 0) return { success: true, data: [] };
    const { data: participants, error: partError } = await supabase
      .from('Participants')
      .select('*')
      .in('group_id', groupIds);

    if (partError) throw partError;
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
/**
 * Calculates aggregated metrics across all managed moderators, groups, and participants.
 */
export const getInstituteStats = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { totalPatients: 0, activeGroups: 0, totalModerators: 0 };
    const { data: instituteData, error } = await supabase
      .from('Profiles')
      .select(`
        id,
        Groups (
          id,
          Participants (id)
        )
      `)
      .eq('role', 'moderator')
      .eq('institution_id', user.id);
    if (error || !instituteData) return { totalPatients: 0, activeGroups: 0, totalModerators: 0 };
    let groupsCount = 0;
    let patientsCount = 0;
    instituteData.forEach(mod => {
      if (mod.Groups) {
        groupsCount += mod.Groups.length;
        mod.Groups.forEach(group => {
          if (group.Participants) patientsCount += group.Participants.length;
        });
      }
    });
    return {
      totalPatients: patientsCount,
      activeGroups: groupsCount,
      totalModerators: instituteData.length
    };
  } catch (error) {
    console.error('Error fetching institute stats:', error.message);
    return { totalPatients: 0, activeGroups: 0, totalModerators: 0 };
  }
};