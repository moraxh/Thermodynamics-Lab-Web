import { db } from "@db/connection"
import { Publication } from "@db/tables"
import { generateIdFromEntropySize } from "lucia"

type PublicationInsert = typeof Publication.$inferInsert

// IMPORTANT: This data is for testing purposes only and should not be used in production.
export const test_publications: PublicationInsert[] = [
  {
    id: generateIdFromEntropySize(10),
    title: 'Avances en la inteligencia artificial aplicada a diagnósticos médicos: Un estudio comparativo de los últimos 5 años',
    description: 'Este artículo explora los desarrollos recientes en algoritmos de IA para diagnóstico médico, comparando técnicas de deep learning con métodos tradicionales. Se analizan 15 estudios de caso con resultados prometedores en detección temprana de cáncer y enfermedades crónicas.',
    type: 'article',
    authors: ['Dr. Carlos Méndez', 'Dra. Laura Fernández'],
    publicationDate: new Date('2023-05-15'),
    filePath: '/publications/avances-ia-medicina.pdf',
    thumbnailPath: '/thumbnails/ia-medicina.jpg'
  },
  {
    id: generateIdFromEntropySize(10),
    title: 'Sostenibilidad urbana: Diseño de ciudades inteligentes que integran espacios verdes y tecnología para reducir la huella de carbono',
    description: 'Libro que presenta estrategias innovadoras para el diseño urbano sostenible, combinando infraestructura verde con soluciones tecnológicas. Basado en un estudio de 10 años en 8 ciudades europeas, ofrece modelos escalables para entornos urbanos.',
    type: 'book',
    authors: ['Arq. Javier Solís', 'Ing. Marta Rovira'],
    publicationDate: new Date('2022-11-20'),
    filePath: '/publications/sostenibilidad-urbana.pdf',
    thumbnailPath: '/thumbnails/ciudades-verdes.jpg'
  },
  {
    id: generateIdFromEntropySize(10),
    title: 'Impacto del cambio climático en los ecosistemas marinos del Pacífico Sur: Análisis de datos satelitales de 2000 a 2022',
    description: 'Tesis doctoral que examina los cambios en la temperatura, acidez y biodiversidad marina utilizando imágenes satelitales de alta resolución y muestreo in situ. Revela patrones alarmantes de disminución de especies clave en un 40% durante el período estudiado.',
    type: 'thesis',
    authors: ['Biól. Marina Ortiz'],
    publicationDate: new Date('2023-02-10'),
    filePath: '/publications/tesis-cambio-climatico.pdf',
    thumbnailPath: '/thumbnails/ecosistemas-marinos.jpg'
  },
  {
    id: generateIdFromEntropySize(10),
    title: 'Desarrollo de nuevos materiales compuestos para la industria aeroespacial: Resultados preliminares de pruebas de resistencia y durabilidad',
    description: 'Reporte técnico que detalla el proceso de creación y evaluación de 3 nuevos materiales compuestos con un 25% más de resistencia al peso que las aleaciones tradicionales. Incluye metodologías de fabricación y resultados de pruebas en condiciones extremas.',
    type: 'technical_report',
    authors: ['Ing. Alejandro Torres', 'Dra. Sofía Chin', 'Dr. Raj Patel'],
    publicationDate: new Date('2023-07-30'),
    filePath: '/publications/materiales-aeroespaciales.pdf',
    thumbnailPath: '/thumbnails/materiales-compuestos.jpg'
  },
  {
    id: generateIdFromEntropySize(10),
    title: 'Historia crítica de los movimientos vanguardistas en América Latina: 1900-1950 - Reinterpretación desde perspectivas decoloniales',
    description: 'Monografía exhaustiva que reevalúa los movimientos artísticos vanguardistas latinoamericanos, cuestionando narrativas eurocéntricas tradicionales. Analiza más de 200 obras de 50 artistas con enfoque en su contexto sociopolítico.',
    type: 'monograph',
    authors: ['Dra. Lucía Ramírez'],
    publicationDate: new Date('2021-09-15'),
    filePath: '/publications/vanguardias-latinoamericanas.pdf',
    thumbnailPath: '/thumbnails/arte-vanguardista.jpg'
  },
  {
    id: generateIdFromEntropySize(10),
    title: 'Efectos psicológicos del teletrabajo prolongado: Estudio longitudinal con 500 profesionales durante la pandemia COVID-19',
    description: 'Investigación que analiza los cambios en salud mental, productividad y relaciones interpersonales en modalidad de trabajo remoto forzado. Los datos revelan aumento del 35% en casos de ansiedad pero mejoría en balance vida-trabajo para el 60% de participantes.',
    type: 'article',
    authors: ['Psic. Daniel Morales', 'Dra. Elena Castro'],
    publicationDate: new Date('2022-03-22'),
    filePath: '/publications/teletrabajo-covid.pdf',
    thumbnailPath: '/thumbnails/salud-laboral.jpg'
  },
  {
    id: generateIdFromEntropySize(10),
    title: 'Principios de economía circular aplicados a la industria textil: Modelos de negocio que reducen el desperdicio en un 90%',
    description: 'Libro que presenta 12 casos de éxito de empresas textiles que implementaron estrategias circulares, desde diseño hasta reciclaje. Incluye análisis de ROI y guías prácticas para la transición sostenible en PYMEs del sector.',
    type: 'book',
    authors: ['Econ. Patricia Núñez', 'Ing. Marco Bianchi'],
    publicationDate: new Date('2023-01-10'),
    filePath: '/publications/economia-circular-textil.pdf',
    thumbnailPath: '/thumbnails/modasostenible.jpg'
  },
  {
    id: generateIdFromEntropySize(10),
    title: 'Optimización de rutas logísticas mediante algoritmos genéticos: Implementación en cadena de suministros de alimentos perecederos',
    description: 'Tesis de maestría que desarrolla un modelo computacional para reducir costos y tiempos de distribución de productos frescos. La solución implementada redujo en un 28% las emisiones de CO2 en la red de distribución estudiada.',
    type: 'thesis',
    authors: ['Ing. Luis Vargas'],
    publicationDate: new Date('2022-08-05'),
    filePath: '/publications/tesis-logistica.pdf',
    thumbnailPath: '/thumbnails/supply-chain.jpg'
  },
  {
    id: generateIdFromEntropySize(10),
    title: 'Evaluación de vulnerabilidades en sistemas IoT domésticos: Análisis de 50 dispositivos inteligentes de 10 fabricantes diferentes',
    description: 'Reporte técnico que expone fallas de seguridad críticas en dispositivos domésticos conectados. Detalla metodologías de pentesting y propone estándares mínimos de encriptación y autenticación para este tipo de tecnologías.',
    type: 'technical_report',
    authors: ['Ing. Ana Beltrán', 'Hacker Ético Pedro Ríos'],
    publicationDate: new Date('2023-04-18'),
    filePath: '/publications/seguridad-iot.pdf',
    thumbnailPath: '/thumbnails/iot-security.jpg'
  },
  {
    id: generateIdFromEntropySize(10),
    title: 'Reinterpretación de los códices prehispánicos a través de inteligencia artificial: Nuevos hallazgos sobre sistemas calendáricos mesoamericanos',
    description: 'Monografía interdisciplinaria que aplica técnicas de procesamiento de imágenes y machine learning para analizar patrones en códices antiguos. Revela correlaciones astronómicas no identificadas previamente en 3 documentos del siglo XVI.',
    type: 'monograph',
    authors: ['Dr. Antonio Zavala', 'Dra. Karen Lee'],
    publicationDate: new Date('2021-12-01'),
    filePath: '/publications/codices-ia.pdf',
    thumbnailPath: '/thumbnails/codices-mesoamericanos.jpg'
  },
  {
    id: generateIdFromEntropySize(10),
    title: 'Terapias génicas innovadoras para enfermedades raras: Revisión sistemática de ensayos clínicos fase III realizados entre 2015-2022',
    description: 'Artículo médico que evalúa la eficacia y seguridad de 15 terapias génicas aprobadas recientemente. Presenta datos prometedores sobre tratamiento de enfermedades como la atrofia muscular espinal y la amaurosis congénita de Leber.',
    type: 'article',
    authors: ['Dr. Roberto Sánchez', 'Dra. Isabelle Dubois', 'Dr. James Wilson'],
    publicationDate: new Date('2023-03-30'),
    filePath: '/publications/terapias-genicas.pdf',
    thumbnailPath: '/thumbnails/medicina-avanzada.jpg'
  },
  {
    id: generateIdFromEntropySize(10),
    title: 'Antropología de la alimentación en comunidades indígenas contemporáneas: Globalización vs preservación cultural',
    description: 'Libro basado en 5 años de trabajo de campo con 12 comunidades en 3 continentes. Documenta cambios en patrones alimenticios y sus implicaciones en salud, identidad cultural y soberanía alimentaria en contextos de globalización acelerada.',
    type: 'book',
    authors: ['Antrop. Gabriela Montes'],
    publicationDate: new Date('2022-06-15'),
    filePath: '/publications/antropologia-alimentacion.pdf',
    thumbnailPath: '/thumbnails/cultura-indigena.jpg'
  },
  {
    id: generateIdFromEntropySize(10),
    title: 'Diseño de reactores nucleares de cuarta generación: Simulaciones computacionales de seguridad pasiva y manejo de residuos',
    description: 'Tesis doctoral que propone un nuevo diseño modular para reactores de sales fundidas con sistemas de seguridad intrínseca. Las simulaciones muestran reducción del 99% en riesgo de fusión del núcleo comparado con diseños convencionales.',
    type: 'thesis',
    authors: ['Ing. Nuclear Felipe Rojas'],
    publicationDate: new Date('2023-01-25'),
    filePath: '/publications/tesis-reactores.pdf',
    thumbnailPath: '/thumbnails/energia-nuclear.jpg'
  },
  {
    id: generateIdFromEntropySize(10),
    title: 'Protocolo para la restauración ecológica de humedales degradados por actividades mineras: Caso de estudio en la Amazonía peruana',
    description: 'Reporte técnico que documenta un proyecto piloto de 3 años con técnicas innovadoras de biorremediación. Logró recuperar el 80% de la biodiversidad original en un área de 50 hectáreas afectada por extracción de oro ilegal.',
    type: 'technical_report',
    authors: ['Biól. Carla Estrada', 'Ing. Ambiental David Huamán'],
    publicationDate: new Date('2022-09-10'),
    filePath: '/publications/restauracion-humedales.pdf',
    thumbnailPath: '/thumbnails/amazonia-ecologia.jpg'
  },
  {
    id: generateIdFromEntropySize(10),
    title: 'Reevaluación de las teorías de urbanización en el antiguo Egipto: Nuevas evidencias arqueológicas de asentamientos del Reino Medio',
    description: 'Monografía que cuestiona modelos tradicionales sobre desarrollo urbano en el valle del Nilo. Presenta hallazgos recientes de 5 excavaciones que sugieren patrones de planificación más complejos de lo que se creía anteriormente.',
    type: 'monograph',
    authors: ['Arqueól. Samira Khalil', 'Dr. Jean-Luc Moreau'],
    publicationDate: new Date('2021-11-05'),
    filePath: '/publications/urbanizacion-egipto.pdf',
    thumbnailPath: '/thumbnails/arqueologia-egipcia.jpg'
  },
  {
    id: generateIdFromEntropySize(10),
    title: 'Impacto de las redes sociales en procesos democráticos: Análisis de campañas políticas digitales en 12 países durante elecciones 2020-2022',
    description: 'Estudio comparativo que cuantifica la influencia de plataformas digitales en comportamiento electoral. Identifica patrones de desinformación pero también casos positivos de participación ciudadana aumentada a través de herramientas digitales.',
    type: 'article',
    authors: ['Polit. Diego Fernández', 'Dra. María Kowalski'],
    publicationDate: new Date('2023-06-18'),
    filePath: '/publications/redes-politica.pdf',
    thumbnailPath: '/thumbnails/democracia-digital.jpg'
  },
  {
    id: generateIdFromEntropySize(10),
    title: 'Manual avanzado de agricultura regenerativa: Técnicas para restaurar suelos degradados y aumentar resiliencia climática',
    description: 'Guía práctica basada en 10 años de investigación aplicada en fincas de América Latina. Incluye protocolos detallados para implementar 20 técnicas diferentes, con datos de monitoreo de carbono en suelo a lo largo del tiempo.',
    type: 'book',
    authors: ['Ing. Agrónomo Omar Paz', 'Dra. Elena Rodríguez'],
    publicationDate: new Date('2022-04-22'),
    filePath: '/publications/agricultura-regenerativa.pdf',
    thumbnailPath: '/thumbnails/suelos-saludables.jpg'
  },
  {
    id: generateIdFromEntropySize(10),
    title: 'Nuevos paradigmas en la enseñanza de matemáticas: Implementación y evaluación de enfoques basados en resolución de problemas reales en educación secundaria',
    description: 'Tesis que evalúa un programa innovador aplicado en 15 escuelas durante 2 años. Los resultados muestran mejora del 40% en competencias matemáticas y mayor interés por carreras STEM entre estudiantes, especialmente mujeres.',
    type: 'thesis',
    authors: ['Pedag. Laura Méndez'],
    publicationDate: new Date('2023-03-15'),
    filePath: '/publications/tesis-educacion-matematicas.pdf',
    thumbnailPath: '/thumbnails/ensenanza-matematicas.jpg'
  },
  {
    id: generateIdFromEntropySize(10),
    title: 'Guía técnica para la implementación de sistemas de captación de agua de lluvia en zonas áridas: Lecciones aprendidas de 20 proyectos en África y América Latina',
    description: 'Documento que sistematiza experiencias prácticas en diseño, construcción y mantenimiento de sistemas de cosecha de agua. Incluye especificaciones técnicas adaptables a diferentes contextos y análisis de costos-beneficios.',
    type: 'technical_report',
    authors: ['Ing. Hidráulica Rosa Alvarado', 'Ing. Tomás Gebre'],
    publicationDate: new Date('2022-07-30'),
    filePath: '/publications/captacion-agua.pdf',
    thumbnailPath: '/thumbnails/agua-lluvia.jpg'
  },
  {
    id: generateIdFromEntropySize(10),
    title: 'Reinterpretación de la filosofía estoica en el contexto contemporáneo: Aplicaciones prácticas para manejo del estrés y toma de decisiones en entornos corporativos',
    description: 'Monografía interdisciplinaria que adapta principios filosóficos antiguos a desafíos modernos. Basada en talleres aplicados con 200 ejecutivos, presenta un modelo innovador para desarrollar resiliencia emocional y liderazgo ético.',
    type: 'monograph',
    authors: ['Filósofo Jorge Silva', 'Psic. Olivia Chang'],
    publicationDate: new Date('2021-10-12'),
    filePath: '/publications/estoicismo-moderno.pdf',
    thumbnailPath: '/thumbnails/filosofia-practica.jpg'
  }
]

export async function seedPublications() {
  await db.insert(Publication).values(test_publications)
}