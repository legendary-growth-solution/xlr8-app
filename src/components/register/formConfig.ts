export const initialFormData = {
  firstName: '',
  lastName: '',
  name: '',
  email: '',
  countryCode: '+91',
  phone: '',
  age: '',
  dob: '',
  selfCheckin: true,
};

export const formFields = [
  {
    name: 'firstName' as const,
    label: 'First Name',
    required: true,
  },
  {
    name: 'lastName' as const,
    label: 'Last Name',
    required: true,
  },
  {
    name: 'age' as const,
    label: 'Age',
    type: 'number',
    required: true,
  },
  {
    name: 'email' as const,
    label: 'Email Address',
    type: 'email',
    required: true,
  },
  {
    name: 'countryCode' as const,
    label: 'Country Code',
    required: true,
  },
  {
    name: 'phone' as const,
    label: 'Phone Number',
    required: true,
  },
  {
    name: 'dob' as const,
    label: 'Date of Birth',
    type: 'date',
  },
]; 