export const initialFormData = {
  name: '',
  email: '',
  phone: '',
  dob: '',
  selfCheckin: true,
};

export const formFields = [
  {
    name: 'name' as const,
    label: 'Full Name',
    required: true,
  },
  {
    name: 'email' as const,
    label: 'Email Address',
    type: 'email',
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