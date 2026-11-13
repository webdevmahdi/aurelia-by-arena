import type { ConstructionUpdateDTO } from '@/types/api';

export const mockConstructionUpdates: ConstructionUpdateDTO[] = [
  // The Solis Pavilion (74%)
  {
    id: 'cu-solis-4',
    projectId: 'proj-solis',
    title: 'Roman Travertine Rain-Screen & Bronze Louver Installation',
    description:
      'Quarry-numbered Tivoli travertine slabs and thermally broken patinated bronze sunscreens are now installed through Level 5. Mock-up testing for acoustic wind load and salt-mist durability passed independent certification.',
    progressPercent: 74,
    date: '2026-10-18T09:00:00.000Z',
    media: [
      {
        id: 'cum-solis-4',
        type: 'IMAGE',
        url: '/media/construction-progress.jpg',
        thumbnailUrl: '/media/construction-progress.jpg',
        alt: 'Travertine stone facade installation on concrete frame',
        title: 'Facade Stone Cladding — October 2026',
        width: 1600,
        height: 1066,
        mimeType: 'image/jpeg',
      },
    ],
  },
  {
    id: 'cu-solis-3',
    projectId: 'proj-solis',
    title: 'Post-Tensioned Superstructure Topping Out',
    description:
      'Structural concrete pour completed across the Level 6 Crown Penthouse slab and cantilevered coastal loggias. Subterranean thermal spa waterproofing and Vals stone mock-ups finalized.',
    progressPercent: 56,
    date: '2026-06-12T09:00:00.000Z',
    media: [],
  },
  {
    id: 'cu-solis-2',
    projectId: 'proj-solis',
    title: 'Marine Secant Piling & Subterranean Vault Completion',
    description:
      'Coastal diaphragm wall, subterranean collector garaging, and structural foundation mat completed ahead of schedule with zero groundwater ingress.',
    progressPercent: 28,
    date: '2026-01-24T09:00:00.000Z',
    media: [],
  },

  // Veridian House Mayfair (62%)
  {
    id: 'cu-veridian-3',
    projectId: 'proj-veridian',
    title: 'Dorset Portland Limestone Ashlar Dressing & Fenestration',
    description:
      'Hand-dressed Portland stone blocks are anchored up to the fourth floor along Carlos Place, accompanied by triple-glazed fluted bronze casement installation and first-fix MEP acoustic commissioning.',
    progressPercent: 62,
    date: '2026-10-25T10:00:00.000Z',
    media: [
      {
        id: 'cum-veridian-3',
        type: 'IMAGE',
        url: '/media/construction-progress.jpg',
        thumbnailUrl: '/media/construction-progress.jpg',
        alt: 'Limestone facade works at Veridian House',
        title: 'Ashlar Masonry Progress — October 2026',
        width: 1600,
        height: 1066,
        mimeType: 'image/jpeg',
      },
    ],
  },
  {
    id: 'cu-veridian-2',
    projectId: 'proj-veridian',
    title: 'Primary Structural Frame & Subterranean Pool Excavation',
    description:
      'Reinforced acoustic concrete frame completed to Level 5 roof belvedere alongside the double-depth basement excavation housing the 20-meter vitality pool and wine vaults.',
    progressPercent: 38,
    date: '2026-05-14T10:00:00.000Z',
    media: [],
  },

  // Casa Caldera Mallorca (100% Completed)
  {
    id: 'cu-caldera-2',
    projectId: 'proj-caldera',
    title: 'Final Architectural Commissioning & Private Handover',
    description:
      'All eighteen hillside residences, botanical olive terraces, geothermal plants, and private sea-access walkways have received final municipal habitation certificates and architectural sign-off.',
    progressPercent: 100,
    date: '2026-08-30T12:00:00.000Z',
    media: [
      {
        id: 'cum-caldera-2',
        type: 'IMAGE',
        url: '/media/project-caldera-hero.jpg',
        thumbnailUrl: '/media/project-caldera-hero.jpg',
        alt: 'Completed Casa Caldera hillside residences',
        title: 'Completed Estate — Handover Commenced',
        width: 1600,
        height: 1066,
        mimeType: 'image/jpeg',
      },
    ],
  },

  // Atelier Nine New York (15% Planned / Early Foundation)
  {
    id: 'cu-atelier-1',
    projectId: 'proj-atelier',
    title: 'Site Preparation, Caisson Drilling & Kiln Brick Firing',
    description:
      'Foundation caisson works have commenced on West 21st Street while bespoke elongated pale clay bricks undergo custom kiln firing in Denmark ahead of superstructure erection.',
    progressPercent: 15,
    date: '2026-10-30T14:00:00.000Z',
    media: [],
  },

  // Palais Serein Geneva (100% Completed)
  {
    id: 'cu-serein-1',
    projectId: 'proj-serein',
    title: 'Minergie-P Certification & Estate Handover Complete',
    description:
      'Palais Serein achieved full Swiss Minergie-P environmental certification and completed bespoke oak joinery commissioning across all twelve lakefront residences.',
    progressPercent: 100,
    date: '2026-07-18T11:00:00.000Z',
    media: [
      {
        id: 'cum-serein-1',
        type: 'IMAGE',
        url: '/media/hero-sanctuary.jpg',
        thumbnailUrl: '/media/hero-sanctuary.jpg',
        alt: 'Completed Palais Serein residences overlooking Lake Geneva',
        title: 'Completed Lakefront Estate',
        width: 1600,
        height: 1066,
        mimeType: 'image/jpeg',
      },
    ],
  },
];
