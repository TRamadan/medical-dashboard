import { Injectable, signal, computed } from '@angular/core';
import { Protocol, Phase, Exercise, Section, SetData, PhaseCriteria, TransitionCriterion, ExerciseType } from '../models/protocol.model';

@Injectable({ providedIn: 'root' })
export class ProtocolService {
    // ── State ────────────────────────────────────────────────────────────────
    readonly protocols = signal<Protocol[]>([
        {
            id: 1,
            name: 'ACL Reconstruction – Standard',
            status: 'active',
            services: [],
            weeks: 12,
            totalSessions: 36,
            template: null,
            createdAt: '2026-04-20',
            createdBy: { id: 101, name: 'Dr. Sarah Mitchell', role: 'Physiotherapist' },
            phases: [
                {
                    name: 'Acute & Protection Phase',
                    totalWeeks: 3,
                    totalSessions: 9,
                    sessionsPerWeek: 3,
                    objective: 'Reduce swelling and pain, protect the graft, and restore basic ROM.',
                    criteria: {
                        progressionCriteria: 'Pain ≤ 3/10 at rest, full passive knee extension, minimal effusion, independent ambulation with crutches',
                        regressionCriteria: 'Pain > 5/10, increased swelling post-session, or inability to complete 50% of sets',
                        precautions: 'No pivoting or twisting, avoid full weight-bearing without crutches, monitor for DVT signs',
                        transitionCriteria: [
                            { id: 1, metric: 'Pain at rest', operator: '≤', value: 3, unit: '/10' },
                            { id: 2, metric: 'Passive knee extension', operator: '≥', value: 0, unit: '°' },
                            { id: 3, metric: 'Effusion grade', operator: '≤', value: 1, unit: 'grade' },
                            { id: 4, metric: 'Crutch independence', operator: '=', value: 1, unit: 'boolean' }
                        ]
                    },
                    weeks: [
                        {
                            weekNumber: 1,
                            sessions: [
                                {
                                    sessionNumber: 1,
                                    applyMeasurements: true,
                                    sections: [
                                        {
                                            sectionName: 'Warm-Up',
                                            exercises: [
                                                {
                                                    type: 'exercise',
                                                    name: 'Ankle Pumps',
                                                    equipment: 'None',
                                                    description: 'Pump ankles up and down to promote circulation.',
                                                    contractionType: 'Isotonic',
                                                    intensityMethod: 'RPE',
                                                    sets: [
                                                        { repetitions: 20, intensity: '2 RPE', tempo: '1-0-1', rest: '30s' },
                                                        { repetitions: 20, intensity: '2 RPE', tempo: '1-0-1', rest: '30s' }
                                                    ],
                                                    progressionRule: {
                                                        title: 'Volume Progression',
                                                        incrementAmount: 5,
                                                        progressionCondition: 'Increase reps by 5 if pain remains ≤ 2/10'
                                                    }
                                                },
                                                {
                                                    type: 'manual',
                                                    name: 'Diaphragmatic Breathing',
                                                    description: 'Guided breathing to reduce stress and promote recovery.',
                                                    videoUrl: 'https://cdn.rehab.io/videos/diaphragmatic-breathing.mp4',
                                                    progressionRule: {
                                                        title: 'Duration Progression',
                                                        incrementAmount: 1,
                                                        progressionCondition: 'Add 1 minute each session if patient is comfortable'
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            sectionName: 'Main Work',
                                            exercises: [
                                                {
                                                    type: 'exercise',
                                                    name: 'Quad Sets',
                                                    equipment: 'Mat',
                                                    description: 'Tighten the quadriceps without moving the knee.',
                                                    contractionType: 'Isometric',
                                                    intensityMethod: 'MVC%',
                                                    sets: [
                                                        { repetitions: 10, intensity: '40% MVC', tempo: '5-0-5', rest: '60s' },
                                                        { repetitions: 10, intensity: '40% MVC', tempo: '5-0-5', rest: '60s' },
                                                        { repetitions: 10, intensity: '40% MVC', tempo: '5-0-5', rest: '60s' }
                                                    ],
                                                    progressionRule: {
                                                        title: 'Intensity Progression',
                                                        incrementAmount: 10,
                                                        progressionCondition: 'Increase MVC% by 10 when patient completes all sets without compensation'
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    sessionNumber: 2,
                                    applyMeasurements: false,
                                    sections: [
                                        {
                                            sectionName: 'Mobility',
                                            exercises: [
                                                {
                                                    type: 'exercise',
                                                    name: 'Heel Slides',
                                                    equipment: 'Mat',
                                                    description: 'Slide heel toward glutes to improve knee flexion ROM.',
                                                    contractionType: 'Isotonic',
                                                    intensityMethod: 'ROM',
                                                    sets: [
                                                        { repetitions: 15, intensity: 'Pain-free range', tempo: '2-1-2', rest: '45s' },
                                                        { repetitions: 15, intensity: 'Pain-free range', tempo: '2-1-2', rest: '45s' }
                                                    ],
                                                    progressionRule: {
                                                        title: 'ROM Progression',
                                                        incrementAmount: 5,
                                                        progressionCondition: 'Increase range by 5° when movement is pain-free'
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    sessionNumber: 3,
                                    applyMeasurements: true,
                                    sections: [
                                        {
                                            sectionName: 'Strengthening',
                                            exercises: [
                                                {
                                                    type: 'exercise',
                                                    name: 'Straight Leg Raises',
                                                    equipment: 'Mat',
                                                    description: 'Lift the leg straight while keeping knee fully extended.',
                                                    contractionType: 'Isotonic',
                                                    intensityMethod: 'RPE',
                                                    sets: [
                                                        { repetitions: 12, intensity: '3 RPE', tempo: '2-1-2', rest: '60s' },
                                                        { repetitions: 12, intensity: '3 RPE', tempo: '2-1-2', rest: '60s' },
                                                        { repetitions: 12, intensity: '3 RPE', tempo: '2-1-2', rest: '60s' }
                                                    ],
                                                    progressionRule: {
                                                        title: 'Load Progression',
                                                        incrementAmount: 0.5,
                                                        progressionCondition: 'Add 0.5kg ankle weight when 3 sets completed without compensation'
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    name: 'Neuromuscular Control Phase',
                    totalWeeks: 4,
                    totalSessions: 12,
                    sessionsPerWeek: 3,
                    objective: 'Restore neuromuscular control, improve proprioception, and begin closed-chain strengthening.',
                    criteria: {
                        progressionCriteria: 'Full active ROM, no post-exercise effusion, single-leg stance ≥ 30s, pain ≤ 2/10',
                        regressionCriteria: 'Effusion returning after sessions, pain > 4/10 during closed-chain exercises',
                        precautions: 'Avoid deep knee flexion beyond 90°, no running or jumping yet',
                        transitionCriteria: [
                            { id: 1, metric: 'Active ROM', operator: '=', value: 140, unit: '°' },
                            { id: 2, metric: 'Single-leg stance', operator: '≥', value: 30, unit: 'sec' },
                            { id: 3, metric: 'Pain during exercise', operator: '≤', value: 2, unit: '/10' },
                            { id: 4, metric: 'Post-exercise effusion', operator: '=', value: 0, unit: 'grade' }
                        ]
                    },
                    weeks: [
                        {
                            weekNumber: 4,
                            sessions: [
                                {
                                    sessionNumber: 1,
                                    applyMeasurements: true,
                                    sections: [
                                        {
                                            sectionName: 'Proprioception',
                                            exercises: [
                                                {
                                                    type: 'exercise',
                                                    name: 'Single-Leg Balance',
                                                    equipment: 'Balance Board',
                                                    description: 'Stand on one leg on a balance board to challenge stability.',
                                                    contractionType: 'Stabilization',
                                                    intensityMethod: 'Duration',
                                                    sets: [
                                                        { repetitions: 1, intensity: '20 seconds', tempo: 'Hold', rest: '60s' },
                                                        { repetitions: 1, intensity: '20 seconds', tempo: 'Hold', rest: '60s' },
                                                        { repetitions: 1, intensity: '20 seconds', tempo: 'Hold', rest: '60s' }
                                                    ],
                                                    progressionRule: {
                                                        title: 'Duration Progression',
                                                        incrementAmount: 10,
                                                        progressionCondition: 'Increase hold time by 10s when 3 sets completed without loss of balance'
                                                    }
                                                },
                                                {
                                                    type: 'manual',
                                                    name: 'Eyes-Closed Balance Drill',
                                                    description: 'Perform single-leg stance with eyes closed to enhance proprioception.',
                                                    videoUrl: 'https://cdn.rehab.io/videos/eyes-closed-balance.mp4',
                                                    progressionRule: {
                                                        title: 'Surface Progression',
                                                        incrementAmount: 1,
                                                        progressionCondition: 'Progress to unstable surface when 30s eyes-closed hold achieved'
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    name: 'Return to Sport Phase',
                    totalWeeks: 5,
                    totalSessions: 15,
                    sessionsPerWeek: 3,
                    objective: 'Restore full strength, power, and sport-specific movement patterns for safe return to play.',
                    criteria: {
                        progressionCriteria: 'Hamstring strength symmetry ≥ 90%, pain-free sprinting, successful agility tests, H:Q ratio ≥ 0.6',
                        regressionCriteria: 'Pain > 2/10 during sprinting, strength symmetry dropping below 85%, fear avoidance behavior',
                        precautions: 'Gradual sprint progression, avoid maximum velocity sprinting until fully cleared',
                        transitionCriteria: [
                            { id: 1, metric: 'Hamstring strength symmetry', operator: '≥', value: 90, unit: '%' },
                            { id: 2, metric: 'H:Q ratio', operator: '≥', value: 0.6, unit: 'ratio' },
                            { id: 3, metric: 'Pain during sprint', operator: '=', value: 0, unit: '/10' },
                            { id: 4, metric: 'Agility test completion', operator: '=', value: 1, unit: 'boolean' }
                        ]
                    },
                    weeks: [
                        {
                            weekNumber: 8,
                            sessions: [
                                {
                                    sessionNumber: 1,
                                    applyMeasurements: true,
                                    sections: [
                                        {
                                            sectionName: 'Power Development',
                                            exercises: [
                                                {
                                                    type: 'exercise',
                                                    name: 'Box Jump',
                                                    equipment: 'Plyometric Box',
                                                    description: 'Jump onto box with bilateral takeoff, focusing on soft landing mechanics.',
                                                    contractionType: 'Plyometric',
                                                    intensityMethod: 'RPE',
                                                    sets: [
                                                        { repetitions: 6, intensity: '6 RPE', tempo: 'Explosive', rest: '90s' },
                                                        { repetitions: 6, intensity: '6 RPE', tempo: 'Explosive', rest: '90s' },
                                                        { repetitions: 6, intensity: '7 RPE', tempo: 'Explosive', rest: '90s' }
                                                    ],
                                                    progressionRule: {
                                                        title: 'Height Progression',
                                                        incrementAmount: 5,
                                                        progressionCondition: 'Increase box height by 5cm when landing mechanics are optimal'
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id: 2,
            name: 'Rotator Cuff Recovery – Non-Surgical',
            status: 'draft',
            services: [],
            weeks: 10,
            totalSessions: 20,
            template: null,
            createdAt: '2026-05-01',
            createdBy: { id: 102, name: 'Dr. James Thornton', role: 'Sports Rehabilitator' },
            phases: [
                {
                    name: 'Pain Management & Mobility Phase',
                    totalWeeks: 3,
                    totalSessions: 6,
                    sessionsPerWeek: 2,
                    objective: 'Reduce pain and inflammation while restoring shoulder mobility and scapular control.',
                    criteria: {
                        progressionCriteria: 'Hamstring strength symmetry ≥ 90%, pain-free sprinting, successful agility tests, H:Q ratio ≥ 0.6',
                        regressionCriteria: 'Pain > 2/10 during sprinting, strength symmetry dropping below 85%, fear avoidance behavior',
                        precautions: 'Gradual sprint progression, avoid maximum velocity sprinting until fully cleared',
                        transitionCriteria: [
                            { id: 1, metric: 'Hamstring strength symmetry', operator: '≥', value: 90, unit: '%' },
                            { id: 2, metric: 'H:Q ratio', operator: '≥', value: 0.6, unit: 'ratio' },
                            { id: 3, metric: 'Pain during sprint', operator: '=', value: 0, unit: '/10' },
                            { id: 4, metric: 'Agility test completion', operator: '=', value: 1, unit: 'boolean' }
                        ]
                    },
                    weeks: [
                        {
                            weekNumber: 1,
                            sessions: [
                                {
                                    sessionNumber: 1,
                                    applyMeasurements: true,
                                    sections: [
                                        {
                                            sectionName: 'Mobility',
                                            exercises: [
                                                {
                                                    type: 'exercise',
                                                    name: 'Pendulum Circles',
                                                    equipment: 'None',
                                                    description: 'Lean forward and let the arm hang, making small circles to decompress the shoulder.',
                                                    contractionType: 'Passive',
                                                    intensityMethod: 'RPE',
                                                    sets: [
                                                        { repetitions: 20, intensity: '1 RPE', tempo: 'Slow', rest: '30s' },
                                                        { repetitions: 20, intensity: '1 RPE', tempo: 'Slow', rest: '30s' }
                                                    ],
                                                    progressionRule: {
                                                        title: 'Range Progression',
                                                        incrementAmount: 2,
                                                        progressionCondition: 'Gradually increase circle diameter as pain decreases'
                                                    }
                                                },
                                                {
                                                    type: 'manual',
                                                    name: 'Heat Therapy Application',
                                                    description: 'Apply moist heat to the shoulder for 15 minutes prior to exercise.',
                                                    videoUrl: 'https://cdn.rehab.io/videos/heat-therapy-shoulder.mp4',
                                                    progressionRule: {
                                                        title: 'Duration Progression',
                                                        incrementAmount: 5,
                                                        progressionCondition: 'Extend to 20 minutes if tolerated well after week 1'
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            sectionName: 'Scapular Stabilization',
                                            exercises: [
                                                {
                                                    type: 'exercise',
                                                    name: 'Scapular Retractions',
                                                    equipment: 'Resistance Band',
                                                    description: 'Squeeze shoulder blades together against light resistance.',
                                                    contractionType: 'Isometric',
                                                    intensityMethod: 'RPE',
                                                    sets: [
                                                        { repetitions: 15, intensity: '3 RPE', tempo: '2-2-2', rest: '45s' },
                                                        { repetitions: 15, intensity: '3 RPE', tempo: '2-2-2', rest: '45s' },
                                                        { repetitions: 15, intensity: '3 RPE', tempo: '2-2-2', rest: '45s' }
                                                    ],
                                                    progressionRule: {
                                                        title: 'Resistance Progression',
                                                        incrementAmount: 1,
                                                        progressionCondition: 'Progress to next band level when 3x15 completed pain-free'
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    name: 'Strengthening & Endurance Phase',
                    totalWeeks: 4,
                    totalSessions: 8,
                    sessionsPerWeek: 2,
                    objective: 'Strengthen rotator cuff and periscapular muscles, improve endurance and dynamic stability.',
                    criteria: {
                        progressionCriteria: 'Hamstring strength symmetry ≥ 90%, pain-free sprinting, successful agility tests, H:Q ratio ≥ 0.6',
                        regressionCriteria: 'Pain > 2/10 during sprinting, strength symmetry dropping below 85%, fear avoidance behavior',
                        precautions: 'Gradual sprint progression, avoid maximum velocity sprinting until fully cleared',
                        transitionCriteria: [
                            { id: 1, metric: 'Hamstring strength symmetry', operator: '≥', value: 90, unit: '%' },
                            { id: 2, metric: 'H:Q ratio', operator: '≥', value: 0.6, unit: 'ratio' },
                            { id: 3, metric: 'Pain during sprint', operator: '=', value: 0, unit: '/10' },
                            { id: 4, metric: 'Agility test completion', operator: '=', value: 1, unit: 'boolean' }
                        ]
                    },
                    weeks: [
                        {
                            weekNumber: 4,
                            sessions: [
                                {
                                    sessionNumber: 1,
                                    applyMeasurements: true,
                                    sections: [
                                        {
                                            sectionName: 'Rotator Cuff Strengthening',
                                            exercises: [
                                                {
                                                    type: 'exercise',
                                                    name: 'External Rotation with Band',
                                                    equipment: 'Resistance Band',
                                                    description: 'Elbow at 90°, rotate forearm outward against band resistance.',
                                                    contractionType: 'Isotonic',
                                                    intensityMethod: 'RPE',
                                                    sets: [
                                                        { repetitions: 15, intensity: '4 RPE', tempo: '2-1-3', rest: '60s' },
                                                        { repetitions: 15, intensity: '4 RPE', tempo: '2-1-3', rest: '60s' },
                                                        { repetitions: 12, intensity: '5 RPE', tempo: '2-1-3', rest: '60s' }
                                                    ],
                                                    progressionRule: {
                                                        title: 'Load Progression',
                                                        incrementAmount: 1,
                                                        progressionCondition: 'Increase band resistance when 3x15 performed with controlled tempo'
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    name: 'Functional Return Phase',
                    totalWeeks: 3,
                    totalSessions: 6,
                    sessionsPerWeek: 2,
                    objective: 'Restore full overhead function and sport/work-specific shoulder mechanics.',
                    criteria: {
                        progressionCriteria: 'Hamstring strength symmetry ≥ 90%, pain-free sprinting, successful agility tests, H:Q ratio ≥ 0.6',
                        regressionCriteria: 'Pain > 2/10 during sprinting, strength symmetry dropping below 85%, fear avoidance behavior',
                        precautions: 'Gradual sprint progression, avoid maximum velocity sprinting until fully cleared',
                        transitionCriteria: [
                            { id: 1, metric: 'Hamstring strength symmetry', operator: '≥', value: 90, unit: '%' },
                            { id: 2, metric: 'H:Q ratio', operator: '≥', value: 0.6, unit: 'ratio' },
                            { id: 3, metric: 'Pain during sprint', operator: '=', value: 0, unit: '/10' },
                            { id: 4, metric: 'Agility test completion', operator: '=', value: 1, unit: 'boolean' }
                        ]
                    },
                    weeks: [
                        {
                            weekNumber: 8,
                            sessions: [
                                {
                                    sessionNumber: 1,
                                    applyMeasurements: true,
                                    sections: [
                                        {
                                            sectionName: 'Overhead Loading',
                                            exercises: [
                                                {
                                                    type: 'exercise',
                                                    name: 'Overhead Press',
                                                    equipment: 'Dumbbells',
                                                    description: 'Press dumbbells overhead from shoulder height, maintaining neutral spine.',
                                                    contractionType: 'Isotonic',
                                                    intensityMethod: '1RM%',
                                                    sets: [
                                                        { repetitions: 10, intensity: '50% 1RM', tempo: '2-1-2', rest: '90s' },
                                                        { repetitions: 10, intensity: '55% 1RM', tempo: '2-1-2', rest: '90s' },
                                                        { repetitions: 8, intensity: '60% 1RM', tempo: '2-1-2', rest: '90s' }
                                                    ],
                                                    progressionRule: {
                                                        title: 'Load Progression',
                                                        incrementAmount: 5,
                                                        progressionCondition: 'Increase load by 5% 1RM when all sets completed with full ROM'
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id: 3,
            name: 'Hamstring Strain – Grade 2',
            status: 'archived',
            services: [],
            weeks: 8,
            totalSessions: 24,
            template: null,
            createdAt: '2026-03-15',
            createdBy: { id: 103, name: 'Dr. Layla Hassan', role: 'Physical Therapist' },
            phases: [
                {
                    name: 'Acute Protection Phase',
                    totalWeeks: 2,
                    totalSessions: 6,
                    sessionsPerWeek: 3,
                    objective: 'Minimize tissue damage, control inflammation, and maintain pain-free range of motion.',
                    criteria: {
                        progressionCriteria: 'Pain ≤ 2/10 during eccentric exercise, full active ROM, hamstring strength ≥ 70%, normal gait',
                        regressionCriteria: 'Pain > 4/10 during eccentric loading, strength deficit > 40% vs contralateral side',
                        precautions: 'Avoid maximal sprinting, no ballistic stretching, monitor soreness 24h post-session',
                        transitionCriteria: [
                            { id: 1, metric: 'Pain during eccentric', operator: '≤', value: 2, unit: '/10' },
                            { id: 2, metric: 'Hamstring strength symmetry', operator: '≥', value: 70, unit: '%' },
                            { id: 3, metric: 'Active ROM', operator: '=', value: 1, unit: 'boolean' },
                            { id: 4, metric: 'Gait pattern', operator: '=', value: 1, unit: 'boolean' }
                        ]
                    },
                    weeks: [
                        {
                            weekNumber: 1,
                            sessions: [
                                {
                                    sessionNumber: 1,
                                    applyMeasurements: true,
                                    sections: [
                                        {
                                            sectionName: 'Isometric Loading',
                                            exercises: [
                                                {
                                                    type: 'exercise',
                                                    name: 'Prone Isometric Hamstring Contraction',
                                                    equipment: 'Mat',
                                                    description: 'Lying prone, gently contract hamstrings against therapist resistance at low intensity.',
                                                    contractionType: 'Isometric',
                                                    intensityMethod: 'MVC%',
                                                    sets: [
                                                        { repetitions: 5, intensity: '20% MVC', tempo: '5-0-5', rest: '90s' },
                                                        { repetitions: 5, intensity: '20% MVC', tempo: '5-0-5', rest: '90s' },
                                                        { repetitions: 5, intensity: '25% MVC', tempo: '5-0-5', rest: '90s' }
                                                    ],
                                                    progressionRule: {
                                                        title: 'Intensity Progression',
                                                        incrementAmount: 5,
                                                        progressionCondition: 'Increase MVC% by 5 when no pain or discomfort reported post-session'
                                                    }
                                                },
                                                {
                                                    type: 'manual',
                                                    name: 'Cold Therapy Protocol',
                                                    description: 'Apply ice pack wrapped in cloth to the posterior thigh for 15 minutes.',
                                                    videoUrl: 'https://cdn.rehab.io/videos/cold-therapy-hamstring.mp4',
                                                    progressionRule: {
                                                        title: 'Frequency Reduction',
                                                        incrementAmount: -1,
                                                        progressionCondition: 'Reduce icing frequency as acute inflammation resolves after day 5'
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    sessionNumber: 2,
                                    applyMeasurements: false,
                                    sections: [
                                        {
                                            sectionName: 'Mobility',
                                            exercises: [
                                                {
                                                    type: 'exercise',
                                                    name: 'Supine Hamstring Stretch',
                                                    equipment: 'Strap',
                                                    description: 'Lying on back, use strap to gently stretch the hamstring within pain-free range.',
                                                    contractionType: 'Passive',
                                                    intensityMethod: 'ROM',
                                                    sets: [
                                                        { repetitions: 3, intensity: 'Pain-free end range', tempo: 'Hold 30s', rest: '30s' },
                                                        { repetitions: 3, intensity: 'Pain-free end range', tempo: 'Hold 30s', rest: '30s' }
                                                    ],
                                                    progressionRule: {
                                                        title: 'ROM Progression',
                                                        incrementAmount: 5,
                                                        progressionCondition: 'Increase stretch range by 5° every 2 sessions if pain-free'
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    name: 'Tissue Remodeling & Strength Phase',
                    totalWeeks: 3,
                    totalSessions: 9,
                    sessionsPerWeek: 3,
                    objective: 'Promote collagen remodeling, restore eccentric strength, and improve tissue capacity.',
                    criteria: {
                        progressionCriteria: 'Pain ≤ 2/10 during eccentric exercise, full active ROM, hamstring strength ≥ 70%, normal gait',
                        regressionCriteria: 'Pain > 4/10 during eccentric loading, strength deficit > 40% vs contralateral side',
                        precautions: 'Avoid maximal sprinting, no ballistic stretching, monitor soreness 24h post-session',
                        transitionCriteria: [
                            { id: 1, metric: 'Pain during eccentric', operator: '≤', value: 2, unit: '/10' },
                            { id: 2, metric: 'Hamstring strength symmetry', operator: '≥', value: 70, unit: '%' },
                            { id: 3, metric: 'Active ROM', operator: '=', value: 1, unit: 'boolean' },
                            { id: 4, metric: 'Gait pattern', operator: '=', value: 1, unit: 'boolean' }
                        ]
                    },
                    weeks: [
                        {
                            weekNumber: 3,
                            sessions: [
                                {
                                    sessionNumber: 1,
                                    applyMeasurements: true,
                                    sections: [
                                        {
                                            sectionName: 'Eccentric Strengthening',
                                            exercises: [
                                                {
                                                    type: 'exercise',
                                                    name: 'Nordic Hamstring Curl',
                                                    equipment: 'Partner / Anchor',
                                                    description: 'Kneel with ankles anchored, slowly lower torso toward floor using hamstrings eccentrically.',
                                                    contractionType: 'Eccentric',
                                                    intensityMethod: 'RPE',
                                                    sets: [
                                                        { repetitions: 5, intensity: '5 RPE', tempo: '4-0-1', rest: '120s' },
                                                        { repetitions: 5, intensity: '5 RPE', tempo: '4-0-1', rest: '120s' },
                                                        { repetitions: 5, intensity: '6 RPE', tempo: '4-0-1', rest: '120s' }
                                                    ],
                                                    progressionRule: {
                                                        title: 'Volume Progression',
                                                        incrementAmount: 1,
                                                        progressionCondition: 'Add 1 rep per set each week when completed without pain'
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    name: 'Return to Sport Phase',
                    totalWeeks: 3,
                    totalSessions: 9,
                    sessionsPerWeek: 3,
                    objective: 'Restore sprint mechanics, explosive power, and sport-specific movement confidence.',
                    criteria: {
                        progressionCriteria: 'Pain ≤ 2/10 during eccentric exercise, full active ROM, hamstring strength ≥ 70%, normal gait',
                        regressionCriteria: 'Pain > 4/10 during eccentric loading, strength deficit > 40% vs contralateral side',
                        precautions: 'Avoid maximal sprinting, no ballistic stretching, monitor soreness 24h post-session',
                        transitionCriteria: [
                            { id: 1, metric: 'Pain during eccentric', operator: '≤', value: 2, unit: '/10' },
                            { id: 2, metric: 'Hamstring strength symmetry', operator: '≥', value: 70, unit: '%' },
                            { id: 3, metric: 'Active ROM', operator: '=', value: 1, unit: 'boolean' },
                            { id: 4, metric: 'Gait pattern', operator: '=', value: 1, unit: 'boolean' }
                        ]
                    },
                    weeks: [
                        {
                            weekNumber: 6,
                            sessions: [
                                {
                                    sessionNumber: 1,
                                    applyMeasurements: true,
                                    sections: [
                                        {
                                            sectionName: 'Speed & Agility',
                                            exercises: [
                                                {
                                                    type: 'exercise',
                                                    name: 'Resisted Sprint Acceleration',
                                                    equipment: 'Sprint Sled',
                                                    description: 'Sprint 20m with sled resistance, focusing on hip drive and hamstring loading.',
                                                    contractionType: 'Isotonic',
                                                    intensityMethod: 'RPE',
                                                    sets: [
                                                        { repetitions: 4, intensity: '7 RPE', tempo: 'Maximal', rest: '180s' },
                                                        { repetitions: 4, intensity: '8 RPE', tempo: 'Maximal', rest: '180s' }
                                                    ],
                                                    progressionRule: {
                                                        title: 'Load & Distance Progression',
                                                        incrementAmount: 5,
                                                        progressionCondition: 'Increase sprint distance by 5m when mechanics are consistently clean'
                                                    }
                                                },
                                                {
                                                    type: 'manual',
                                                    name: 'High Knee Running Drill',
                                                    description: 'Perform high knee running at progressive speeds to reinforce hamstring recruitment patterns.',
                                                    videoUrl: 'https://cdn.rehab.io/videos/high-knee-drill.mp4',
                                                    progressionRule: {
                                                        title: 'Speed Progression',
                                                        incrementAmount: 10,
                                                        progressionCondition: 'Increase speed by 10% each session when form remains controlled'
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]);

    readonly showStepper = signal(false);
    readonly activeProtocol = signal<Protocol | null>(null);
    readonly currentStep = signal(1);
    readonly stepperMode = signal<'create' | 'view' | 'edit'>('create');

    readonly protocolCount = computed(() => this.protocols().length);

    // ── Protocol CRUD ────────────────────────────────────────────────────────
    startNewProtocol(): void {
        const newProtocol: Protocol = {
            id: Date.now(),
            name: '',
            status: 'draft',
            services: [],
            weeks: null,
            totalSessions: null,
            template: null,
            phases: [this.createPhase(1)],
            createdAt: new Date().toISOString().split('T')[0],
            createdBy: {
                id: 0,
                name: '',
                role: ''
            }
        };
        this.activeProtocol.set(newProtocol);
        this.stepperMode.set('create');
        this.currentStep.set(1);
        this.showStepper.set(true);
    }

    viewProtocol(protocol: Protocol): void {
        this.activeProtocol.set({ ...protocol });
        this.stepperMode.set('view');
        this.currentStep.set(1);
        this.showStepper.set(true);
    }

    editProtocol(protocol: Protocol): void {
        this.activeProtocol.set({ ...protocol });
        this.stepperMode.set('edit');
        this.currentStep.set(1);
        this.showStepper.set(true);
    }

    finaliseProtocol(): void {
        const proto = this.activeProtocol();
        if (!proto) return;
        proto.status = 'active';
        this.protocols.update(list => [...list, proto]);
        this.activeProtocol.set(null);
        this.showStepper.set(false);
        this.stepperMode.set('create');
        this.currentStep.set(1);
    }

    saveProtocolAsDraft(): void {
        const proto = this.activeProtocol();
        if (!proto) return;
        proto.status = 'draft';
        this.protocols.update(list => [...list, proto]);
        this.activeProtocol.set(null);
        this.showStepper.set(false);
        this.stepperMode.set('create');
        this.currentStep.set(1);
    }

    saveEditedProtocol(): void {
        const proto = this.activeProtocol();
        if (!proto) return;
        this.protocols.update(list =>
            list.map(p => (p.id === proto.id ? { ...proto } : p))
        );
        this.activeProtocol.set(null);
        this.showStepper.set(false);
        this.stepperMode.set('create');
        this.currentStep.set(1);
    }

    cancelProtocol(): void {
        this.activeProtocol.set(null);
        this.showStepper.set(false);
        this.stepperMode.set('create');
        this.currentStep.set(1);
    }

    // ── Phase helpers ────────────────────────────────────────────────────────
    createPhase(id: number): Phase {
        return {
            id,
            name: `Phase ${id}: New Phase`,
            totalWeeks: 0,
            totalSessions: 0,
            sessionsPerWeek: 0,
            objective: '',
            criteria: this.createCriteria(),
            weeks: [],
            measurementSessionNums: []
        };
    }

    createCriteria(): PhaseCriteria {
        return {
            progressionCriteria: '',
            regressionCriteria: '',
            precautions: '',
            transitionCriteria: []
        };
    }

    // ── Transition Criteria helpers ──────────────────────────────────────────
    addTransitionCriterion(phase: Phase): void {
        if (!phase.criteria.transitionCriteria) phase.criteria.transitionCriteria = [];
        phase.criteria.transitionCriteria.push({
            id: Date.now(),
            metric: '',
            operator: '≥',
            value: null,
            unit: ''
        });
    }

    removeTransitionCriterion(phase: Phase, index: number): void {
        phase.criteria.transitionCriteria.splice(index, 1);
    }

    // ── Section helpers ──────────────────────────────────────────────────────
    createSection(): Section {
        return {
            sectionName: 'New Section',
            time: '',
            exercises: [this.createExercise()]
        };
    }

    // ── Exercise helpers ─────────────────────────────────────────────────────
    createExercise(): Exercise {
        return {
            type: 'exercise',
            name: '',
            equipment: '',
            description: '',
            contractionType: 'Eccentric',
            intensityMethod: 'kg/lb',
            sets: [{ repetitions: 0, intensity: '', tempo: '', rest: '' }],
            progressionRule: {
                title: '',
                incrementAmount: 0,
                progressionCondition: ''
            }
        } as ExerciseType;
    }

    // ── Set-data sync ────────────────────────────────────────────────────────


    // ── Range helpers ────────────────────────────────────────────────────────
    getRange(count: number | string): number[] {
        const num = parseInt(String(count), 10);
        if (isNaN(num) || num <= 0) return [];
        return Array.from({ length: num }, (_, i) => i + 1);
    }

    getTotalSessions(weeks: number | string, perWeek: number | string): number {
        const w = parseInt(String(weeks), 10);
        const s = parseInt(String(perWeek), 10);
        if (isNaN(w) || isNaN(s)) return 0;
        return w * s;
    }

    getSessionNumber(weekNum: number, sessionInWeek: number, perWeek: number | string): number {
        return (weekNum - 1) * parseInt(String(perWeek), 10) + sessionInWeek;
    }

    syncSetData(ex: Exercise): number[] {
        if (ex.type !== 'exercise') return [];

        const count = Math.max(1, Math.min((ex as ExerciseType).sets.length || 1, 20));
        const sets = (ex as ExerciseType).sets;

        while (sets.length < count) {
            const last = sets[sets.length - 1];
            sets.push({
                repetitions: last?.repetitions ?? 0,
                intensity: last?.intensity ?? '',
                tempo: last?.tempo ?? '',
                rest: last?.rest ?? ''
            });
        }

        if (sets.length > count) sets.length = count;

        return Array.from({ length: count }, (_, i) => i);
    }


    ensureSessionData(phase: Phase, sessionNum: number): void {
        const weekIndex = Math.floor((sessionNum - 1) / phase.sessionsPerWeek);
        const sessionIndex = (sessionNum - 1) % phase.sessionsPerWeek;

        if (!phase.weeks[weekIndex]) {
            phase.weeks[weekIndex] = {
                weekNumber: weekIndex + 1,
                sessions: []
            };
        }

        const week = phase.weeks[weekIndex];

        if (!week.sessions[sessionIndex]) {
            week.sessions[sessionIndex] = {
                sessionNumber: sessionNum,
                applyMeasurements: false,
                sections: [
                    {
                        sectionName: 'Warm Up',
                        time: '10 min',
                        exercises: []
                    }
                ]
            };
        }
    }
}
