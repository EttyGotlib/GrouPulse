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
};