export interface StudentData {
  name: string;
  phone: string;
}

export interface StudentResponse {
  id: number;
  name: string;
  phone: string;
}

const url = 'http://localhost:5001';

export const createStudent = async (
  studentData: StudentData
): Promise<StudentResponse | undefined> => {
  // Allowing for the possibility of undefined
  try {
    const response = await fetch(`${url}/api/students`, {
      // Ensure you include 'http://' for a valid URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentData),
    });

    if (!response.ok) {
      throw new Error('Failed to create student');
    }

    return (await response.json()) as StudentResponse; // Ensure you return the response
  } catch (error) {
    console.error(`The User/Student couldn't be created`, error);
    return undefined; // Explicitly return undefined in case of an error
  }
};

export const getAllStudents = async (): Promise<
  StudentResponse[] | undefined
> => {
  try {
    const response = await fetch(`${url}/api/students`);

    if (!response.ok) {
      throw new Error('Failed to retrieve all the students');
    }

    return (await response.json()) as StudentResponse;
  } catch (error) {
    console.error('Failure to retrieve all the students');
    return undefined;
  }
};
