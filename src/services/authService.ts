export const signupUser = async (credentials: any) => {
  const response = await fetch('/api/v1/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json() as { error?: string };
    throw new Error(errorData.error || 'Signup failed');
  }

  return response.json();
};

export const loginUser = async (credentials: any) => {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json() as { error?: string };
    throw new Error(errorData.error || 'Login failed');
  }

  return response.json();
}; 