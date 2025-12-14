export const SITE_INFO = {
  name: 'LISTER',
  fullName: 'Laboratorio de Investigación en Sistemas Termodinámicos y Energías Renovables',
  description: 'Avanzando en la frontera de la termodinámica, la inteligencia artificial y la sostenibilidad energética.',
  institution: 'UG - División de Ingenierías Campus Irapuato Salamanca DICIS',
} as const;

export const CONTACT_INFO = {
  emails: {
    general: 'contacto@thermolab-future.com',
    research: 'research@thermolab-future.com',
  },
  phones: {
    main: '+34 91 123 45 67',
    secondary: '+34 91 987 65 43',
  },
  address: {
    line1: 'Carretera Salamanca - Valle de Santiago km 3.5 + 1.8',
    line2: 'Comunidad de Palo Blanco, 36787 Salamanca, Gto.',
    line3: 'UG - División de Ingenierías Campus Irapuato Salamanca DICIS',
    coordinates: {
      lat: '20.5073163',
      lon: '-101.193337',
      latDisplay: '20.5073° N',
      lonDisplay: '101.1933° W',
    },
  },
} as const;

export const SOCIAL_LINKS = {
  github: 'https://github.com/lister-lab',
} as const;

export const CREATORS = [
  {
    name: 'Jorge Mora',
    username: 'moraxh',
    github: 'https://github.com/moraxh',
  },
  {
    name: 'Hadassah Garcia',
    username: 'HadassahGarcia',
    github: 'https://github.com/HadassahGarcia',
  },
] as const;
