export interface CoachData {
  name: string;
  phone: string;
}

export interface CoachResponse {
  id: number;
  name: string;
  phone: string;
}

const url = 'http://localhost:5001';

export const createCoach = async (
  coachData: CoachData
): Promise<CoachResponse | undefined> => {
  try {
    const response = await fetch(`${url}/api/coaches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(coachData),
    });
    if (!response.ok) {
      throw new Error('Failed to create coach');
    }

    return (await response.json()) as CoachResponse;
  } catch (error) {
    console.error(`The User/Coach coudln't be created`);
  }
};

export const getAllCoaches = async (): Promise<CoachResponse[] | undefined> => {
  try {
    const response = await fetch(`${url}/api/coaches`);

    if (!response.ok) {
      throw new Error('Failed to retrieve all the coaches');
    }

    return (await response.json()) as CoachResponse;
  } catch (error) {
    console.error(`Failure to retrieve all the coaches`);
  }
};
