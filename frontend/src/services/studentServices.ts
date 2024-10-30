export interface StudentData {
  name: string;
  phone: string;
}

export interface StudentResponse {
  id: number;
  name: string;
  phone: string;
}

export const createStudent = async (
  studentData: StudentData
): Promise<StudentResponse | undefined> => {
  // Allowing for the possibility of undefined
  try {
    const response = await fetch('http://localhost:5001/api/students', {
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
