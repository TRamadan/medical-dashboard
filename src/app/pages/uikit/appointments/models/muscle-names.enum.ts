// ─────────────────────────────────────────────────────────────
// Human muscle-skeleton map — used to convert the muscles chosen
// on the body-map UI into the numeric `painLocations` array the
// API expects on `InjuryData`.
// ─────────────────────────────────────────────────────────────
export enum MuscleName {
    LeftTibialisAnterior = 0,
    RightTibialisAnterior = 1,
    SoleusRight = 2,
    SoleusLeft = 3,
    GastrocnemiusLateralRight = 4,
    GastrocnemiusMedialRight = 5,
    GastrocnemiusLateralLeft = 6,
    GastrocnemiusMedialLeft = 7,
    LeftQuadriceps = 8,
    LeftAdductor = 9,
    RightAdductor = 10,
    RightQuadriceps = 11,
    LateralHamstringsBicepsRight = 12,
    MedialHamstringsSemiRight = 13,
    MedialHamstringsSemiLeft = 14,
    LateralHamstringBicepsLeft = 15,
    GluteusMediusRight = 16,
    GluteusMediusLeft = 17,
    GluteusMaximusRight = 18,
    GluteusMaximusLeft = 19,
    LeftLowerAbs = 20,
    RightLowerAbs = 21,
    LeftAbsUpper = 22,
    RightAbsUpper = 23,
    LeftSerratusAnterior = 24,
    RightSerratusAnterior = 25,
    LeftExternalOblique = 26,
    RightExternalOblique = 27,
    LeftTrapezuisLower = 28,
    RightTrapezuisLower = 29,
    LeftTrapezuisMid = 30,
    RightTrapezuisMid = 31,
    RightTrapezuisUpper = 32,
    LeftTrapezuisUpper = 33,
    LeftUpperChestClavicular = 34,
    RightUpperChestClavicular = 35,
    LeftLowerChestSternal = 36,
    RightLowerChestSternal = 37,
    LeftForearm = 38,
    RightForearm = 39,
    ForearmExtensorRight = 40,
    ForearmFlexorRight = 41,
    ForearmFlexorLeft = 42,
    ForearmExtensorLeft = 43,
    RightLatsLower = 44,
    LeftLatsLower = 45,
    RightLatsMid = 46,
    LeftLatsMid = 47,
    LeftShoulderFront = 48,
    RightShoulderFront = 49,
    LeftShoulderSide = 50,
    RightShoulderSide = 51,
    LeftBiceps = 52,
    RightBiceps = 53,
    RightLatsUpper = 54,
    LeftLatsUpper = 55,
    LeftTricepsLongHead = 56,
    LeftTricepsLateralHead = 57,
    RightTricepsLongHead = 58,
    RightTricepsLateralHead = 59,
    LeftGroinsHipFlexor = 60,
    RightGroinsHipFlexor = 61,
}

/**
 * Real, human-readable muscle names as they appear in `assets/muscle-polygons.json`
 * — this is the exact text `MuscleSkeletonViewerComponent` uses for `part.name`,
 * polygon click events, hover labels, and the "Selected Muscles" tag list.
 *
 * IMPORTANT: this array is positionally aligned with the `MuscleName` enum
 * (index 0 = LeftTibialisAnterior ... index 61 = RightGroinsHipFlexor) —
 * NOT string-matched against the enum's PascalCase keys. The JSON's real
 * names contain their own typos/casing/spacing quirks ("Sholder", "Mats",
 * "Felexor", "Maximas", "left quadriceps") that don't line up with the
 * enum key spellings, so matching by key name silently drops everything.
 * Matching by array position is reliable regardless of either side's typos.
 *
 * If `muscle-polygons.json` is ever reordered or a muscle is added/removed,
 * this array MUST be regenerated from that file to stay in sync.
 */
export const MUSCLE_DISPLAY_NAMES: readonly string[] = [
    'Left Tibialis Anterior',
    'Right Tibialis Anterior',
    'Soleus Right',
    'Soleus Left',
    'Gastrocnemius Lateral Right',
    'Gastrocnemius Medial Right',
    'Gastrocnemius Lateral Left',
    'Gastrocnemius Medial Left',
    'left quadriceps',
    'Left Adductor',
    'Right Adductor',
    'Right Quadriceps',
    'Lateral Hamstrings (Biceps) Right',
    'Medial Hamstrings (Semi) Right',
    'Medial Hamstring (Semi) Left',
    'Lateral Hamstring (Biceps) Left',
    'Gluteus Medial right',
    'Gluteus Medial Left',
    'Gluteus Maximus right',
    'Gluteus Maximas Left',
    'Left Lower Abs',
    'Right Lower Abs',
    'Left Abs Upper',
    'Right Abs Upper',
    'Left Serratus Anterior',
    'Right Serratus Anterior',
    'Left External Oblique',
    'Right External Oblique',
    'Left Trapezius (Lower)',
    'Right Trapezius (Lower)',
    'Left Trapezius Mid',
    'Right Trapezius (Mid)',
    'Right Trapezius (Upper)',
    'Left Trapezius (Upper)',
    'Left Upper chest (Calvicular)',
    'Right Upper chest (Calvicular)',
    'Left Lower Chest (Sternal)',
    'Right Lower Chest (Sternal)',
    'Left Forearm',
    'Right Forearm',
    'Forearm Extensor Right',
    'Forearm Flexor Right',
    'Forearm Felexor Left',
    'Forearm Extensor Left',
    'Right Lats (Lower)',
    'Left Lats (Lower)',
    'Right Mats (Mid)',
    'Left Mats (Mid)',
    'Left Shoulder Front',
    'Right Sholder Front',
    'Left Sholder (Side)',
    'Right Sholder (Side)',
    'Left Biceps',
    'Right Biceps',
    'Right Lats (Upper)',
    'Left Lats Upper ',
    'Left Triceps (Long Head)',
    'Left Triceps (Lateral Head)',
    'Right Triceps (Long Head)',
    'Right Triceps (Lateral Head)',
    'Left Groins / Hip Flexor',
    'Right Groins / Hip Flexor',
];

/**
 * Maps a muscle's real display name (as emitted by the body-map viewer,
 * e.g. "Right Quadriceps" or the typo'd "Right Sholder Front") to its
 * numeric `MuscleName` enum value, by looking up its position in
 * `MUSCLE_DISPLAY_NAMES`. Returns `undefined` if the name isn't found
 * (e.g. the JSON asset was edited and this array wasn't regenerated).
 */
export function mapMuscleNameToEnum(name: string): MuscleName | undefined {
    const index = MUSCLE_DISPLAY_NAMES.indexOf(name);
    return index === -1 ? undefined : (index as MuscleName);
}

/**
 * Reverse lookup: given a `MuscleName` enum value (e.g. from a saved
 * `painLocations` array coming back from the API), returns the real
 * display name to show in the UI — the same text the body-map viewer
 * uses for its polygons, so a muscle looks up highlighted correctly.
 */
export function getMuscleDisplayName(value: MuscleName): string {
    return MUSCLE_DISPLAY_NAMES[value] ?? '';
}

/**
 * Converts an array of selected muscle display names into the numeric array
 * expected by `InjuryData.painLocations`. Unrecognized names are
 * silently dropped (so a stale/renamed muscle name never breaks submit).
 */
export function mapMusclesToPainLocations(selected: string[]): number[] {
    return (selected ?? [])
        .map(mapMuscleNameToEnum)
        .filter((value): value is MuscleName => value !== undefined);
}

/**
 * Converts an array of numeric `MuscleName` values (e.g. `painLocations`
 * loaded from an existing consultation) back into the real display names
 * the body-map viewer needs in its `[selectedMuscles]` input to highlight
 * them correctly.
 */
export function mapPainLocationsToMuscleNames(painLocations: number[]): string[] {
    return (painLocations ?? [])
        .filter((value): value is MuscleName => value in MUSCLE_DISPLAY_NAMES)
        .map(value => getMuscleDisplayName(value));
}