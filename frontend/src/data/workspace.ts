import type { Department, Subscriber } from '../types/studio'

export const initialDepartments: Department[] = [
  { id: 'dep-editorial', name: 'Editorial', color: '#B4552D' },
  { id: 'dep-studio', name: 'Studio Ops', color: '#2F6F5E' },
  { id: 'dep-patrons', name: 'Patrons', color: '#5B4BB7' },
  { id: 'dep-press', name: 'Press', color: '#A4762A' },
]

export const initialSubscribers: Subscriber[] = [
  {
    id: 'sub-1',
    name: 'Ivana Vasquez',
    email: 'ivana@lathala.studio',
    role: 'Creative Director',
    departmentId: 'dep-editorial',
    status: 'sent',
  },
  {
    id: 'sub-2',
    name: 'Marcus Oyelaran',
    email: 'marcus.o@northlight.co',
    role: 'Managing Editor',
    departmentId: 'dep-editorial',
    status: 'pending',
  },
  {
    id: 'sub-3',
    name: 'Rhea Kapoor',
    email: 'rhea@kapoorstudio.in',
    role: 'Production Lead',
    departmentId: 'dep-studio',
    status: 'pending',
  },
  {
    id: 'sub-4',
    name: 'Tomas Lindqvist',
    email: 'tomas@formhaus.se',
    role: 'Print Buyer',
    departmentId: 'dep-studio',
    status: 'sent',
  },
  {
    id: 'sub-5',
    name: 'Amelie Rousseau',
    email: 'amelie.r@maisonpaper.fr',
    role: 'Patron',
    departmentId: 'dep-patrons',
    status: 'pending',
  },
  {
    id: 'sub-6',
    name: 'Dara Ogunleye',
    email: 'dara@collectivelagos.org',
    role: 'Patron',
    departmentId: 'dep-patrons',
    status: 'pending',
  },
  {
    id: 'sub-7',
    name: 'Nina Sørensen',
    email: 'nina@kinfolkpress.dk',
    role: 'Features Writer',
    departmentId: 'dep-press',
    status: 'pending',
  },
  {
    id: 'sub-8',
    name: 'Julian Reyes',
    email: 'j.reyes@quarterlymag.com',
    role: 'Critic',
    departmentId: 'dep-press',
    status: 'sent',
  },
  {
    id: 'sub-9',
    name: 'Hana Miyazaki',
    email: 'hana@atelierhm.jp',
    role: 'Type Designer',
    departmentId: 'dep-studio',
    status: 'pending',
  },
]
