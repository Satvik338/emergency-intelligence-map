import type { SafetyInstruction } from '../types';

export const safetyInstructions: SafetyInstruction[] = [
  // PERSON + FLOOD
  {
    id: 'SAFE-P-FLOOD',
    entity: 'person',
    disaster: 'flood',
    steps: [
      { order: 1, title: 'Move to Higher Ground', description: 'Immediately move to the highest floor or rooftop. Do NOT go into attic spaces without a way to break through to the roof.', icon: 'ArrowUp', isUrgent: true },
      { order: 2, title: 'Stay Away from Floodwater', description: 'Never walk, swim, or drive through floodwaters. Just 6 inches of moving water can knock you down. 2 feet can sweep away a vehicle.', icon: 'AlertTriangle', isUrgent: true },
      { order: 3, title: 'Turn Off Utilities', description: 'If safe to do so, turn off electricity, gas, and water mains. Do NOT touch electrical equipment if wet or standing in water.', icon: 'Zap', isUrgent: false },
      { order: 4, title: 'Signal for Help', description: 'Use a whistle, flashlight, or bright cloth to signal rescuers. If on a roof, stay in a visible area. Call 112 for emergencies.', icon: 'Phone', isUrgent: false },
      { order: 5, title: 'Keep Emergency Kit Ready', description: 'Keep a waterproof bag with medicines, documents, phone with charger, clean water, and non-perishable food.', icon: 'Package', isUrgent: false },
      { order: 6, title: 'Listen to Official Alerts', description: 'Keep a battery-powered radio for updates. Follow instructions from district administration and NDRF teams.', icon: 'Radio', isUrgent: false },
    ],
    warnings: [
      '⚠️ Do NOT enter floodwater to save belongings.',
      '⚠️ Beware of snakes and scorpions displaced by flooding.',
      '⚠️ Contaminated water causes cholera and typhoid — drink only boiled/purified water.',
    ],
  },
  // PERSON + FIRE
  {
    id: 'SAFE-P-FIRE',
    entity: 'person',
    disaster: 'fire',
    steps: [
      { order: 1, title: 'Get Low and Move Fast', description: 'Crawl low under smoke to exit. Toxic smoke rises — cleaner air is near the floor. Cover nose and mouth with wet cloth.', icon: 'ArrowDown', isUrgent: true },
      { order: 2, title: 'Stop, Drop, and Roll', description: 'If clothes catch fire: STOP moving, DROP to the ground, and ROLL to smother flames. Cover face with hands.', icon: 'ShieldAlert', isUrgent: true },
      { order: 3, title: 'Check Doors Before Opening', description: 'Feel door with back of hand. If hot, do NOT open — find another exit. Close doors behind you to slow fire spread.', icon: 'DoorOpen', isUrgent: true },
      { order: 4, title: 'Evacuate Immediately', description: 'Leave belongings. Help children and elderly first. Use stairs, NEVER elevators. Go to designated assembly point.', icon: 'Footprints', isUrgent: false },
      { order: 5, title: 'Call Fire Services', description: 'Dial 101 (Fire) or 112 (Emergency). Give exact location, number of people trapped, and type of fire if known.', icon: 'Phone', isUrgent: false },
    ],
    warnings: [
      '⚠️ NEVER go back inside a burning building.',
      '⚠️ Watch for structural collapse — move away from weakened buildings.',
      '⚠️ Smoke inhalation kills more people than flames — protect your airways.',
    ],
  },
  // PERSON + EARTHQUAKE
  {
    id: 'SAFE-P-EQ',
    entity: 'person',
    disaster: 'earthquake',
    steps: [
      { order: 1, title: 'Drop, Cover, Hold', description: 'DROP to hands and knees. Take COVER under sturdy furniture. HOLD ON until shaking stops. Protect your head and neck.', icon: 'Shield', isUrgent: true },
      { order: 2, title: 'Stay Indoor if Safe', description: 'If inside, stay inside. Move away from windows, mirrors, and heavy objects. Do NOT stand in doorways (myth).', icon: 'Home', isUrgent: true },
      { order: 3, title: 'Move to Open Area if Outside', description: 'If outdoors, move to an open area away from buildings, trees, power lines, and roads. Drop and cover head.', icon: 'TreePine', isUrgent: false },
      { order: 4, title: 'If Driving', description: 'Pull over to a clear area. Stop the car. Stay inside with seatbelt on until shaking stops. Avoid bridges and overpasses.', icon: 'Car', isUrgent: false },
      { order: 5, title: 'After Shaking Stops', description: 'Check for injuries. Expect aftershocks. Check for gas leaks and structural damage. Use text messages, not calls.', icon: 'ClipboardCheck', isUrgent: false },
    ],
    warnings: [
      '⚠️ Aftershocks can be nearly as strong — stay alert for hours.',
      '⚠️ Do NOT use elevators during or after an earthquake.',
      '⚠️ Wear shoes after — broken glass and debris everywhere.',
    ],
  },
  // PERSON + LANDSLIDE
  {
    id: 'SAFE-P-LAND',
    entity: 'person',
    disaster: 'landslide',
    steps: [
      { order: 1, title: 'Move Away from Slide Path', description: 'Move laterally (sideways) away from the landslide path. Do NOT try to outrun it downhill. Get to high ground.', icon: 'ArrowUpRight', isUrgent: true },
      { order: 2, title: 'Watch for Warning Signs', description: 'Sudden ground cracking, tilting trees, unusual water flow, rumbling sounds — evacuate immediately if observed.', icon: 'Eye', isUrgent: true },
      { order: 3, title: 'Evacuate if in Risk Zone', description: 'If authorities issue evacuation order, leave immediately. Take essential documents, medicines, and go bag.', icon: 'Footprints', isUrgent: false },
      { order: 4, title: 'After the Slide', description: 'Stay away from the slide area. Check for trapped people. Report to local authorities. Do not return until cleared.', icon: 'AlertTriangle', isUrgent: false },
    ],
    warnings: [
      '⚠️ Landslides can be triggered by heavy rain hours after the rain stops.',
      '⚠️ Never build or camp at the base of steep slopes during monsoon.',
      '⚠️ Secondary slides are common — stay alert after the first event.',
    ],
  },
  // ANIMALS (simplified - same steps for all disasters with animal-specific advice)
  {
    id: 'SAFE-ANIMAL-FLOOD',
    entity: 'farm_animal',
    disaster: 'flood',
    steps: [
      { order: 1, title: 'Human Safety First', description: '⚠️ DO NOT endanger your own life to rescue animals. Ensure all people are safe before attempting animal rescue.', icon: 'Heart', isUrgent: true },
      { order: 2, title: 'Move Animals to High Ground', description: 'Guide livestock to elevated, dry areas. Open gates to allow natural escape routes. Remove halters/tethers immediately.', icon: 'Mountain', isUrgent: true },
      { order: 3, title: 'Provide Emergency Feed & Water', description: 'Move stored fodder to dry areas. Ensure clean water access. Floodwater is contaminated — do not let animals drink it.', icon: 'Droplets', isUrgent: false },
      { order: 4, title: 'Contact Veterinary Help', description: 'Report injured animals to the nearest veterinary office. Use the government Kisan Call Centre (1800-180-1551).', icon: 'Phone', isUrgent: false },
      { order: 5, title: 'Document for Insurance', description: 'Photograph all livestock and damage for Fasal Bima Yojana claims. Keep ear-tag numbers recorded.', icon: 'Camera', isUrgent: false },
    ],
    warnings: [
      '⚠️ DO NOT risk human life for animal rescue — always prioritize people first.',
      '⚠️ Frightened animals may kick or bite — approach calmly from the side.',
      '⚠️ Do not release cattle into standing floodwater — they may drown.',
    ],
  },
  {
    id: 'SAFE-PET-FLOOD',
    entity: 'pet',
    disaster: 'flood',
    steps: [
      { order: 1, title: 'Human Safety First', description: '⚠️ Ensure all people are safe before attempting pet rescue. Your life is the top priority.', icon: 'Heart', isUrgent: true },
      { order: 2, title: 'Keep Pets Close', description: 'Put cats in carriers. Keep dogs on short leash. Familiar items (toy, blanket) reduce panic. Do NOT let pets swim in floodwater.', icon: 'Heart', isUrgent: true },
      { order: 3, title: 'Prepare Go Bag for Pets', description: 'Pack: 3 days food, water, medications, leash/carrier, vaccination records, ID photos, waste bags.', icon: 'Package', isUrgent: false },
      { order: 4, title: 'Identify Pet-Friendly Shelters', description: 'Call ahead to shelters. Many emergency shelters do not accept pets. Know nearby vet clinics and pet-friendly accommodations.', icon: 'Home', isUrgent: false },
    ],
    warnings: [
      '⚠️ Never tie up or cage a pet in a flood zone — they need to be able to escape.',
      '⚠️ Pets can sense danger early — unusual behavior may be a warning signal.',
    ],
  },
  {
    id: 'SAFE-WILDFIRE',
    entity: 'wildlife',
    disaster: 'fire',
    steps: [
      { order: 1, title: 'Do NOT Approach Wildlife', description: 'Wildfire-displaced animals are stressed, scared, and unpredictable. Keep safe distance. Do not attempt to handle.', icon: 'AlertTriangle', isUrgent: true },
      { order: 2, title: 'Leave Escape Routes Open', description: 'Do not block natural wildlife corridors. Leave gates open. Remove obstacles from forest paths.', icon: 'TreePine', isUrgent: true },
      { order: 3, title: 'Provide Water Sources', description: 'Place clean water bowls at forest edges for displaced wildlife. Do NOT leave food — it attracts animals to dangerous areas.', icon: 'Droplets', isUrgent: false },
      { order: 4, title: 'Report Injured Wildlife', description: 'Call Wildlife Rescue: 1800-425-4747. Photograph location from safe distance. Contact local forest department.', icon: 'Phone', isUrgent: false },
    ],
    warnings: [
      '⚠️ Injured animals may carry diseases — do not touch without protection.',
      '⚠️ Snakes displaced by fire are extremely dangerous — watch your step.',
    ],
  },
];

export function getSafetyInstruction(entity: string, disaster: string): SafetyInstruction | undefined {
  return safetyInstructions.find(s => s.entity === entity && s.disaster === disaster);
}
