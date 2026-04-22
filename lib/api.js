import { supabase } from './supabase';

/**
 * פונקציה ליצירת קבוצה חדשה והוספת המשתתפים שלה
 */
export const createNewGroup = async (groupData, participantsList) => {
  try {
   
    const { data: { user } } = await supabase.auth.getUser();
    
   
    const { data: group, error: groupError } = await supabase
      .from('Groups')
      .insert([{
        name: groupData.name,
        description: groupData.type, 
        moderator_id: user?.id       
      }])
      .select()
      .single();

    if (groupError) throw groupError;

    
    if (participantsList.length > 0) {
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

export const getDashboardData = async () => {
    const { data: groups, error: groupsError } = await supabase.from('Groups').select('*');
    if (groupsError) throw groupsError;

    const { data: participants, error: participantsError } = await supabase.from('Participants').select('group_id');
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
        totalParticipants: participants.length,
        weeklyMeetings: 0,
        missingNotes: 0
    };

    return { groups: groupsWithCount, stats };
};
