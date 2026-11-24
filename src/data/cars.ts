export type VehicleConditionType = 'Brand New' | 'Used';
export type BodyStyle = 'Sedan' | 'SUV' | 'Crossover' | 'Coupe';

export type GalleryAngleKey =
  | 'front'
  | 'rear'
  | 'left'
  | 'right'
  | 'trunk'
  | 'bonnet'
  | 'interior'
  | 'cabin';

export interface GalleryMediaItem {
  id: string;
  angle: GalleryAngleKey;
  shortLabel: string;
  label: string;
  type: 'exterior' | 'interior';
  src: string;
}

export interface ConditionBreakdown {
  overallGrade: string;
  exteriorScore: string;
  interiorScore: string;
  mechanicalScore: string;
  historySummary: string;
  inspectionNote: string;
}

export interface CarListing {
  id: string;
  stockCode: string;
  make: string;
  model: string;
  trim: string;
  year: number;
  conditionType: VehicleConditionType;
  bodyStyle: BodyStyle;
  price: number;
  mileageKm: number;
  fuelType: string;
  transmission: string;
  drivetrain: string;
  powerHp: number;
  exteriorColor: string;
  interiorTrim: string;
  image: string;
  interiorImage: string;
  gallery: GalleryMediaItem[];
  secondaryImages: string[];
  summary: string;
  features: string[];
  condition: ConditionBreakdown;
}

export interface CommercialScene {
  id: string;
  carId: string;
  conditionType: VehicleConditionType;
  kicker: string;
  headline: string;
  caption: string;
  image: string;
  interiorImage: string;
  durationSec: number;
}

export interface TikTokReel {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  featuredCar: string;
  make: string;
  year: number;
  price: number;
  conditionType: VehicleConditionType;
  carId: string;
  coverImage: string;
  interiorImage: string;
  highlights: string[];
}

export interface CustomerTestimonial {
  id: string;
  customerName: string;
  avatarInitials: string;
  location: string;
  buyerRole: string;
  purchasedCar: string;
  carId: string;
  conditionType: VehicleConditionType;
  rating: number;
  quote: string;
}

export type MessagePresetIntent =
  | 'availability'
  | 'inspection'
  | 'walkaround'
  | 'pricing';

export const SELLER_CHANNELS = {
  businessName: 'Morgan Car Hub',
  tiktokHandle: '@cheap_cars49',
  tiktokUrl: 'https://www.tiktok.com/@cheap_cars49',
  telegramHandle: '@Morgancarhub',
  telegramUrl: 'https://t.me/Morgancarhub',
  whatsappUrl: 'https://wa.me/message/3N4MB4P7GAFLJ1',
};

export function getCarMessagePreset(
  car: CarListing,
  intent: MessagePresetIntent = 'availability'
): string {
  const header = `${car.year} ${car.make} ${car.model} ${car.trim} (${car.conditionType}, Stock ${car.stockCode}, $${car.price.toLocaleString()})`;
  if (intent === 'inspection') {
    return `Hi Morgan Car Hub, I would like to book an in-person inspection and review the full condition sheet for the ${header}. Please share available showroom times.`;
  }
  if (intent === 'walkaround') {
    return `Hi Morgan Car Hub, please send a live exterior and interior walkaround video for the ${header} (${car.exteriorColor} / ${car.interiorTrim}, ${car.mileageKm.toLocaleString()} km).`;
  }
  if (intent === 'pricing') {
    return `Hi Morgan Car Hub, I am ready to proceed on the ${header}. Please confirm the final cash or Paystack deposit terms and delivery timeline.`;
  }
  return `Hi Morgan Car Hub, is the ${header} still available? Exterior: ${car.exteriorColor}, Interior: ${car.interiorTrim}, Mileage: ${car.mileageKm.toLocaleString()} km. Please share next steps.`;
}

interface VehicleVariantSpec {
  year: number;
  model: string;
  trim: string;
  conditionType: VehicleConditionType;
  price: number;
  mileageKm: number;
  fuelType: string;
  transmission: string;
  drivetrain: string;
  powerHp: number;
}

interface VehiclePlatformTemplate {
  slug: string;
  make: string;
  bodyStyle: BodyStyle;
  exteriorColor: string;
  interiorTrim: string;
  extFront: string;
  extFrontLabel?: string;
  extRear: string;
  extRearLabel?: string;
  extRight?: string;
  extTrunk: string;
  extBonnet?: string;
  extBonnetLabel?: string;
  intFront: string;
  intRear?: string;
  summaryTemplate: string;
  features: string[];
  variants: VehicleVariantSpec[];
}

const VEHICLE_PLATFORMS: VehiclePlatformTemplate[] = [
  {
    slug: 'porsche-taycan',
    make: 'Porsche',
    bodyStyle: 'Sedan',
    exteriorColor: 'Chalk Metallic',
    interiorTrim: 'Black Race-Tex & Slate Grey Leather',
    extFront: '/src/assets/images/hero_taycan_commercial_1795509366473.jpg',
    extFrontLabel: 'Front & Left View',
    extRear: '/src/assets/images/ext_rear_porsche_taycan_1795515346667.jpg',
    extRearLabel: 'Rear & Left View',
    extRight: '/src/assets/images/profile_right_taycan_1795517391586.jpg',
    extTrunk: '/src/assets/images/trunk_sedan_bay_1795517392969.jpg',
    extBonnet: '/src/assets/images/taycan_bonnet_frunk_1795517390768.jpg',
    extBonnetLabel: 'Bonnet & Front Frunk',
    intFront: '/src/assets/images/int_porsche_taycan_1795510210074.jpg',
    intRear: '/src/assets/images/int_rear_porsche_taycan_1795515346906.jpg',
    summaryTemplate:
      'Chalk Metallic Porsche Taycan finished with Black Race-Tex cockpit, adaptive air suspension, Sport Chrono clock, and 800-volt fast charging.',
    features: [
      'Adaptive Air Suspension with PASM',
      'Matrix Design LED Headlights in Black',
      'Sport Chrono Stopwatch & Mode Switch',
      'BOSE Surround Sound System (14 Speakers)',
      '360-Degree Surround View & ParkAssist',
      'Curved Digital Cluster & Passenger Display',
      '21-Inch RS Spyder Satin Black Wheels',
      'Panoramic Fixed Glass Roof',
    ],
    variants: [
      { year: 2026, model: 'Taycan GTS', trim: 'Performance Battery Plus', conditionType: 'Brand New', price: 138900, mileageKm: 18, fuelType: 'All-Electric (93.4 kWh)', transmission: '2-Speed Rear / Direct Front', drivetrain: 'Dual-Motor AWD', powerHp: 590 },
      { year: 2026, model: 'Taycan 4S', trim: 'Sport Turismo Spec', conditionType: 'Brand New', price: 119400, mileageKm: 22, fuelType: 'All-Electric (93.4 kWh)', transmission: '2-Speed Automatic', drivetrain: 'Dual-Motor AWD', powerHp: 536 },
      { year: 2026, model: 'Taycan Turbo', trim: 'Weissach Aero Package', conditionType: 'Brand New', price: 164500, mileageKm: 14, fuelType: 'All-Electric (105 kWh)', transmission: '2-Speed Automatic', drivetrain: 'Dual-Motor AWD', powerHp: 871 },
      { year: 2026, model: 'Taycan', trim: 'Base Performance Plus', conditionType: 'Brand New', price: 102800, mileageKm: 16, fuelType: 'All-Electric (93.4 kWh)', transmission: '2-Speed Rear', drivetrain: 'Rear-Wheel Drive', powerHp: 402 },
      { year: 2025, model: 'Taycan GTS', trim: 'Black Edition Allocation', conditionType: 'Brand New', price: 132900, mileageKm: 29, fuelType: 'All-Electric (93.4 kWh)', transmission: '2-Speed Automatic', drivetrain: 'Dual-Motor AWD', powerHp: 590 },
      { year: 2025, model: 'Taycan 4S', trim: 'Executive Tech Package', conditionType: 'Brand New', price: 114200, mileageKm: 25, fuelType: 'All-Electric (93.4 kWh)', transmission: '2-Speed Automatic', drivetrain: 'Dual-Motor AWD', powerHp: 522 },
      { year: 2024, model: 'Taycan GTS', trim: 'Sport Chrono AWD', conditionType: 'Used', price: 108500, mileageKm: 11400, fuelType: 'All-Electric (93.4 kWh)', transmission: '2-Speed Automatic', drivetrain: 'Dual-Motor AWD', powerHp: 590 },
      { year: 2024, model: 'Taycan 4S', trim: 'Performance Battery Plus', conditionType: 'Used', price: 94200, mileageKm: 14900, fuelType: 'All-Electric (93.4 kWh)', transmission: '2-Speed Automatic', drivetrain: 'Dual-Motor AWD', powerHp: 522 },
      { year: 2023, model: 'Taycan 4S', trim: 'Premium Package AWD', conditionType: 'Used', price: 86900, mileageKm: 19800, fuelType: 'All-Electric (93.4 kWh)', transmission: '2-Speed Automatic', drivetrain: 'Dual-Motor AWD', powerHp: 522 },
      { year: 2023, model: 'Taycan', trim: 'Base Chalk Edition', conditionType: 'Used', price: 76500, mileageKm: 22400, fuelType: 'All-Electric (79.2 kWh)', transmission: '2-Speed Rear', drivetrain: 'Rear-Wheel Drive', powerHp: 402 },
      { year: 2022, model: 'Taycan GTS', trim: 'Carbon Ceramic Spec', conditionType: 'Used', price: 89400, mileageKm: 27600, fuelType: 'All-Electric (93.4 kWh)', transmission: '2-Speed Automatic', drivetrain: 'Dual-Motor AWD', powerHp: 590 },
      { year: 2022, model: 'Taycan Turbo', trim: 'Full Leather Executive', conditionType: 'Used', price: 97800, mileageKm: 31200, fuelType: 'All-Electric (93.4 kWh)', transmission: '2-Speed Automatic', drivetrain: 'Dual-Motor AWD', powerHp: 670 },
    ],
  },
  {
    slug: 'range-rover-sport',
    make: 'Land Rover',
    bodyStyle: 'SUV',
    exteriorColor: 'Satin Gunmetal Grey',
    interiorTrim: 'Ebony Semi-Aniline Perforated Leather',
    extFront: '/src/assets/images/hero_rangerover_commercial_1795509370496.jpg',
    extFrontLabel: 'Front & Left View',
    extRear: '/src/assets/images/ext_rear_range_rover_1795515347085.jpg',
    extRearLabel: 'Rear & Left View',
    extRight: '/src/assets/images/profile_right_rangerover_1795517392040.jpg',
    extTrunk: '/src/assets/images/trunk_suv_bay_1795517393482.jpg',
    intFront: '/src/assets/images/int_range_rover_sport_1795510210242.jpg',
    intRear: '/src/assets/images/int_rear_range_rover_1795515347785.jpg',
    summaryTemplate:
      'Satin Gunmetal Grey Range Rover Sport featuring Ebony semi-aniline perforated leather cabin, dynamic air suspension, and Pivi Pro curved display.',
    features: [
      'Dynamic Air Suspension with All-Wheel Steering',
      'Meridian Signature 3D Surround Audio',
      '13.1-Inch Pivi Pro Curved Touchscreen',
      '22-Way Heated, Ventilated & Massage Seats',
      'Soft-Close Doors & Powered Gesture Tailgate',
      'Digital LED Headlights with Signature DRL',
      'Terrain Response 2 Off-Road Suite',
      'Executive Reclining Rear Lounge Cabin',
    ],
    variants: [
      { year: 2026, model: 'Range Rover Sport', trim: 'Autobiography P400', conditionType: 'Brand New', price: 118500, mileageKm: 24, fuelType: '3.0L I6 Mild-Hybrid', transmission: '8-Speed ZF Automatic', drivetrain: 'All-Wheel Drive', powerHp: 395 },
      { year: 2026, model: 'Range Rover Sport', trim: 'Dynamic SE P360', conditionType: 'Brand New', price: 96400, mileageKm: 19, fuelType: '3.0L I6 Mild-Hybrid', transmission: '8-Speed ZF Automatic', drivetrain: 'All-Wheel Drive', powerHp: 355 },
      { year: 2026, model: 'Range Rover Sport', trim: 'SV Edition Two V8', conditionType: 'Brand New', price: 158900, mileageKm: 12, fuelType: '4.4L Twin-Turbo V8 MHEV', transmission: '8-Speed ZF Automatic', drivetrain: 'All-Wheel Drive', powerHp: 626 },
      { year: 2026, model: 'Range Rover Sport', trim: 'Autobiography P460e PHEV', conditionType: 'Brand New', price: 124900, mileageKm: 20, fuelType: '3.0L Plug-In Hybrid', transmission: '8-Speed ZF Automatic', drivetrain: 'All-Wheel Drive', powerHp: 454 },
      { year: 2025, model: 'Range Rover Sport', trim: 'Dynamic HSE P400', conditionType: 'Brand New', price: 109800, mileageKm: 31, fuelType: '3.0L I6 Mild-Hybrid', transmission: '8-Speed ZF Automatic', drivetrain: 'All-Wheel Drive', powerHp: 395 },
      { year: 2025, model: 'Range Rover Sport', trim: 'Autobiography P530 V8', conditionType: 'Brand New', price: 136500, mileageKm: 28, fuelType: '4.4L Twin-Turbo V8', transmission: '8-Speed ZF Automatic', drivetrain: 'All-Wheel Drive', powerHp: 523 },
      { year: 2024, model: 'Range Rover Sport', trim: 'Autobiography P400', conditionType: 'Used', price: 98400, mileageKm: 12600, fuelType: '3.0L I6 Mild-Hybrid', transmission: '8-Speed ZF Automatic', drivetrain: 'All-Wheel Drive', powerHp: 395 },
      { year: 2024, model: 'Range Rover Sport', trim: 'Dynamic SE P360', conditionType: 'Used', price: 84900, mileageKm: 16200, fuelType: '3.0L I6 Mild-Hybrid', transmission: '8-Speed ZF Automatic', drivetrain: 'All-Wheel Drive', powerHp: 355 },
      { year: 2023, model: 'Range Rover Sport', trim: 'First Edition P530', conditionType: 'Used', price: 102500, mileageKm: 21800, fuelType: '4.4L Twin-Turbo V8', transmission: '8-Speed ZF Automatic', drivetrain: 'All-Wheel Drive', powerHp: 523 },
      { year: 2023, model: 'Range Rover Sport', trim: 'SE P360 Black Pack', conditionType: 'Used', price: 78200, mileageKm: 24500, fuelType: '3.0L I6 Mild-Hybrid', transmission: '8-Speed ZF Automatic', drivetrain: 'All-Wheel Drive', powerHp: 355 },
      { year: 2022, model: 'Range Rover Sport', trim: 'HSE Dynamic P400', conditionType: 'Used', price: 66900, mileageKm: 34200, fuelType: '3.0L I6 Mild-Hybrid', transmission: '8-Speed Automatic', drivetrain: 'All-Wheel Drive', powerHp: 395 },
      { year: 2022, model: 'Range Rover Sport', trim: 'SVR Carbon Edition', conditionType: 'Used', price: 89500, mileageKm: 28900, fuelType: '5.0L Supercharged V8', transmission: '8-Speed Automatic', drivetrain: 'All-Wheel Drive', powerHp: 575 },
    ],
  },
  {
    slug: 'mercedes-c-class',
    make: 'Mercedes-Benz',
    bodyStyle: 'Sedan',
    exteriorColor: 'Obsidian Black Metallic',
    interiorTrim: 'Sienna Brown & Black Perforated Leather',
    extFront: '/src/assets/images/car_mercedes_c300_1795509367136.jpg',
    extFrontLabel: 'Front & Left View',
    extRear: '/src/assets/images/ext_rear_mercedes_c300_1795515347532.jpg',
    extRearLabel: 'Rear & Left View',
    extTrunk: '/src/assets/images/trunk_sedan_bay_1795517392969.jpg',
    extBonnet: '/src/assets/images/bonnet_c300_engine_1795517413950.jpg',
    extBonnetLabel: 'Bonnet & Engine Bay',
    intFront: '/src/assets/images/int_mercedes_c300_1795510210395.jpg',
    intRear: '/src/assets/images/int_rear_mercedes_c300_1795515348303.jpg',
    summaryTemplate:
      'Obsidian Black Mercedes-Benz C-Class sedan pairing AMG exterior bodywork with a Sienna Brown & Black cabin and portrait MBUX cockpit.',
    features: [
      'AMG Line Exterior Body Styling & Star Grille',
      '11.9-Inch Central Portrait MBUX Display',
      'Wireless Apple CarPlay & Android Auto',
      '64-Color Active Ambient Cabin Lighting',
      'Panoramic Tilt/Slide Glass Sunroof',
      'Blind Spot Assist & Active Brake Assist',
      '19-Inch AMG Multi-Spoke Bi-Color Alloys',
      'Keyless-GO with Hands-Free Trunk Access',
    ],
    variants: [
      { year: 2026, model: 'C300 AMG Line', trim: '4MATIC Pinnacle Trim', conditionType: 'Brand New', price: 57400, mileageKm: 11, fuelType: '2.0L Turbo + 48V EQ Boost', transmission: '9G-TRONIC 9-Speed', drivetrain: '4MATIC AWD', powerHp: 255 },
      { year: 2026, model: 'C300 Exclusive', trim: 'Rear-Wheel Executive', conditionType: 'Brand New', price: 52900, mileageKm: 14, fuelType: '2.0L Turbo + 48V EQ Boost', transmission: '9G-TRONIC 9-Speed', drivetrain: 'Rear-Wheel Drive', powerHp: 255 },
      { year: 2026, model: 'AMG C43 4MATIC', trim: 'Handcrafted Biturbo', conditionType: 'Brand New', price: 68900, mileageKm: 10, fuelType: '2.0L Electric-Turbo Hybrid', transmission: 'AMG SPEEDSHIFT 9-Speed', drivetrain: 'AMG Performance 4MATIC', powerHp: 416 },
      { year: 2025, model: 'C300 AMG Line', trim: '4MATIC Executive Sedan', conditionType: 'Brand New', price: 54800, mileageKm: 12, fuelType: '2.0L Turbo + 48V EQ Boost', transmission: '9G-TRONIC 9-Speed', drivetrain: '4MATIC AWD', powerHp: 255 },
      { year: 2025, model: 'C200 AMG Line', trim: 'Night Package Sedan', conditionType: 'Brand New', price: 48600, mileageKm: 18, fuelType: '1.5L Turbo + 48V EQ Boost', transmission: '9G-TRONIC 9-Speed', drivetrain: 'Rear-Wheel Drive', powerHp: 204 },
      { year: 2025, model: 'C300e AMG Line', trim: 'Plug-In Hybrid Sedan', conditionType: 'Brand New', price: 59200, mileageKm: 15, fuelType: '2.0L Plug-In Hybrid', transmission: '9G-TRONIC 9-Speed', drivetrain: 'Rear-Wheel Drive', powerHp: 308 },
      { year: 2024, model: 'C300 AMG Line', trim: '4MATIC Premium', conditionType: 'Used', price: 45900, mileageKm: 12400, fuelType: '2.0L Turbo + 48V EQ Boost', transmission: '9G-TRONIC 9-Speed', drivetrain: '4MATIC AWD', powerHp: 255 },
      { year: 2024, model: 'C200 AMG Line', trim: 'Avantgarde Interior', conditionType: 'Used', price: 41200, mileageKm: 15800, fuelType: '1.5L Turbo + 48V EQ Boost', transmission: '9G-TRONIC 9-Speed', drivetrain: 'Rear-Wheel Drive', powerHp: 204 },
      { year: 2023, model: 'C300 4MATIC', trim: 'AMG Line Night Spec', conditionType: 'Used', price: 41800, mileageKm: 23500, fuelType: '2.0L Turbo + 48V EQ Boost', transmission: '9G-TRONIC 9-Speed', drivetrain: '4MATIC AWD', powerHp: 255 },
      { year: 2023, model: 'AMG C43 4MATIC', trim: 'Driver Assistance Pro', conditionType: 'Used', price: 54900, mileageKm: 18900, fuelType: '2.0L Electric-Turbo Hybrid', transmission: 'AMG SPEEDSHIFT 9-Speed', drivetrain: '4MATIC AWD', powerHp: 402 },
      { year: 2022, model: 'C300 AMG Line', trim: 'Exclusive Trim Sedan', conditionType: 'Used', price: 37400, mileageKm: 31400, fuelType: '2.0L Turbo + 48V EQ Boost', transmission: '9G-TRONIC 9-Speed', drivetrain: 'Rear-Wheel Drive', powerHp: 255 },
      { year: 2022, model: 'C200 AMG Line', trim: 'Pinnacle Edition', conditionType: 'Used', price: 34900, mileageKm: 36800, fuelType: '1.5L Turbo + 48V EQ Boost', transmission: '9G-TRONIC 9-Speed', drivetrain: 'Rear-Wheel Drive', powerHp: 204 },
    ],
  },
  {
    slug: 'ford-mustang',
    make: 'Ford',
    bodyStyle: 'Coupe',
    exteriorColor: 'Vapor Blue Metallic',
    interiorTrim: 'Black Onyx Leather Sport Cockpit',
    extFront: '/src/assets/images/car_ford_mustang_gt_1795510215093.jpg',
    extFrontLabel: 'Front & Left View',
    extRear: '/src/assets/images/mustang_rear_angle_1795517390986.jpg',
    extRearLabel: 'Rear & Right View',
    extTrunk: '/src/assets/images/trunk_sedan_bay_1795517392969.jpg',
    extBonnet: '/src/assets/images/bonnet_mustang_v8_1795517413754.jpg',
    extBonnetLabel: 'Bonnet & 5.0L V8 Bay',
    intFront: '/src/assets/images/int_ford_mustang_gt_1795510217124.jpg',
    summaryTemplate:
      'Vapor Blue Metallic Ford Mustang Fastback coupe with Black Onyx leather sport cockpit, dual curved digital displays, and performance chassis.',
    features: [
      'Active Valve Performance Exhaust',
      '12.4-Inch Digital Cluster + 13.2-Inch SYNC 4',
      'B&O 12-Speaker Sound System w/ Subwoofer',
      'Heated & Cooled Black Onyx Leather Seats',
      'Brembo 6-Piston Front Brake Calipers',
      '19-Inch Dark Tarnish Multi-Spoke Wheels',
      'Ford Co-Pilot360 Assist+ Safety Suite',
      'Track Apps Telemetry & Line-Lock System',
    ],
    variants: [
      { year: 2026, model: 'Mustang GT Premium', trim: '5.0L V8 Fastback', conditionType: 'Brand New', price: 53400, mileageKm: 12, fuelType: '5.0L Ti-VCT Coyote V8', transmission: '6-Speed Manual w/ Rev Match', drivetrain: 'Rear-Wheel Drive + LSD', powerHp: 480 },
      { year: 2026, model: 'Mustang Dark Horse', trim: 'Tremec Track Package', conditionType: 'Brand New', price: 64900, mileageKm: 10, fuelType: '5.0L Modified Coyote V8', transmission: '6-Speed Tremec Manual', drivetrain: 'Rear-Wheel Drive + Torsen', powerHp: 500 },
      { year: 2026, model: 'Mustang EcoBoost Premium', trim: 'High Performance Pack', conditionType: 'Brand New', price: 41200, mileageKm: 16, fuelType: '2.3L EcoBoost Turbo I4', transmission: '10-Speed SelectShift', drivetrain: 'Rear-Wheel Drive', powerHp: 315 },
      { year: 2025, model: 'Mustang GT Premium', trim: '5.0L V8 Fastback', conditionType: 'Brand New', price: 51900, mileageKm: 15, fuelType: '5.0L Ti-VCT Coyote V8', transmission: '6-Speed Manual w/ Rev Match', drivetrain: 'Rear-Wheel Drive + LSD', powerHp: 480 },
      { year: 2025, model: 'Mustang GT Fastback', trim: 'GT Performance Pack', conditionType: 'Brand New', price: 49500, mileageKm: 21, fuelType: '5.0L Ti-VCT Coyote V8', transmission: '10-Speed Automatic', drivetrain: 'Rear-Wheel Drive + LSD', powerHp: 486 },
      { year: 2025, model: 'Mustang EcoBoost', trim: 'Nite Pony Fastback', conditionType: 'Brand New', price: 38900, mileageKm: 19, fuelType: '2.3L EcoBoost Turbo I4', transmission: '10-Speed SelectShift', drivetrain: 'Rear-Wheel Drive', powerHp: 315 },
      { year: 2024, model: 'Mustang GT Premium', trim: '6-Speed Performance', conditionType: 'Used', price: 44800, mileageKm: 9800, fuelType: '5.0L Ti-VCT Coyote V8', transmission: '6-Speed Manual w/ Rev Match', drivetrain: 'Rear-Wheel Drive + LSD', powerHp: 480 },
      { year: 2024, model: 'Mustang Dark Horse', trim: 'Handling Package', conditionType: 'Used', price: 56200, mileageKm: 7400, fuelType: '5.0L Modified Coyote V8', transmission: '6-Speed Tremec Manual', drivetrain: 'Rear-Wheel Drive + Torsen', powerHp: 500 },
      { year: 2024, model: 'Mustang EcoBoost Premium', trim: '201A Equipment Group', conditionType: 'Used', price: 34500, mileageKm: 14200, fuelType: '2.3L EcoBoost Turbo I4', transmission: '10-Speed Automatic', drivetrain: 'Rear-Wheel Drive', powerHp: 315 },
      { year: 2023, model: 'Mustang GT Premium', trim: '401A Digital Package', conditionType: 'Used', price: 39400, mileageKm: 21600, fuelType: '5.0L Ti-VCT Coyote V8', transmission: '6-Speed Manual', drivetrain: 'Rear-Wheel Drive + LSD', powerHp: 450 },
      { year: 2022, model: 'Mustang Mach 1', trim: 'Tremec 6-Speed Coupe', conditionType: 'Used', price: 43900, mileageKm: 24800, fuelType: '5.0L Coyote V8', transmission: '6-Speed Tremec Manual', drivetrain: 'Rear-Wheel Drive + Torsen', powerHp: 470 },
      { year: 2021, model: 'Mustang GT Fastback', trim: 'California Special', conditionType: 'Used', price: 35600, mileageKm: 33500, fuelType: '5.0L Ti-VCT Coyote V8', transmission: '10-Speed Automatic', drivetrain: 'Rear-Wheel Drive', powerHp: 460 },
    ],
  },
  {
    slug: 'toyota-land-cruiser',
    make: 'Toyota',
    bodyStyle: 'SUV',
    exteriorColor: 'Ice Cap Pearl White',
    interiorTrim: 'Java Brown Perforated SofTex',
    extFront: '/src/assets/images/car_land_cruiser_1795509367786.jpg',
    extFrontLabel: 'Front & Right View',
    extRear: '/src/assets/images/ext_rear_land_cruiser_1795515348604.jpg',
    extRearLabel: 'Rear & Left View',
    extTrunk: '/src/assets/images/trunk_suv_bay_1795517393482.jpg',
    extBonnet: '/src/assets/images/bonnet_landcruiser_engine_1795517416416.jpg',
    extBonnetLabel: 'Bonnet & Hybrid Bay',
    intFront: '/src/assets/images/int_toyota_land_cruiser_1795510212725.jpg',
    intRear: '/src/assets/images/int_rear_land_cruiser_1795515348666.jpg',
    summaryTemplate:
      'Ice Cap Pearl White Toyota Land Cruiser 250 with Java Brown perforated cabin, full-time 4WD locking differentials, and Toyota Safety Sense 3.0.',
    features: [
      'Full-Time 4WD with Crawl Control & Multi-Terrain Select',
      'Stabilizer Disconnect Mechanism (SDM)',
      '12.3-Inch Toyota Multimedia + JBL 14-Speaker',
      'Multi-Terrain Monitor 360-Degree Camera',
      'Heated & Ventilated Java Brown Front Seats',
      '2400W AC Inverter Cargo Power Outlet',
      'Toyota Safety Sense 3.0 Driver Suite',
      'Roof Rails & Heavy-Duty Skid Plate Package',
    ],
    variants: [
      { year: 2026, model: 'Land Cruiser 250', trim: 'First Edition Hybrid 4WD', conditionType: 'Brand New', price: 74900, mileageKm: 15, fuelType: '2.4L i-FORCE MAX Hybrid', transmission: '8-Speed Automatic', drivetrain: 'Full-Time 4WD', powerHp: 326 },
      { year: 2026, model: 'Land Cruiser 250', trim: 'Heritage 1958 Edition', conditionType: 'Brand New', price: 61800, mileageKm: 18, fuelType: '2.4L i-FORCE MAX Hybrid', transmission: '8-Speed Automatic', drivetrain: 'Full-Time 4WD', powerHp: 326 },
      { year: 2026, model: 'Land Cruiser Prado', trim: 'VX Executive 4WD', conditionType: 'Brand New', price: 71200, mileageKm: 14, fuelType: '2.8L Turbo Diesel + 48V', transmission: '8-Speed Automatic', drivetrain: 'Full-Time 4WD', powerHp: 204 },
      { year: 2026, model: 'Land Cruiser Prado', trim: 'TX-L 7-Seater 4WD', conditionType: 'Brand New', price: 66500, mileageKm: 20, fuelType: '2.4L Turbo Petrol', transmission: '8-Speed Automatic', drivetrain: 'Full-Time 4WD', powerHp: 278 },
      { year: 2025, model: 'Land Cruiser 250', trim: 'Premium Package Hybrid', conditionType: 'Brand New', price: 69900, mileageKm: 26, fuelType: '2.4L i-FORCE MAX Hybrid', transmission: '8-Speed Automatic', drivetrain: 'Full-Time 4WD', powerHp: 326 },
      { year: 2025, model: 'Land Cruiser Prado', trim: 'GXR Middle East Spec', conditionType: 'Brand New', price: 68400, mileageKm: 22, fuelType: '2.4L Turbo Petrol', transmission: '8-Speed Automatic', drivetrain: 'Full-Time 4WD', powerHp: 278 },
      { year: 2024, model: 'Land Cruiser 250', trim: 'First Edition 4WD', conditionType: 'Used', price: 64900, mileageKm: 14800, fuelType: '2.4L i-FORCE MAX Hybrid', transmission: '8-Speed Automatic', drivetrain: 'Full-Time 4WD', powerHp: 326 },
      { year: 2024, model: 'Land Cruiser 250', trim: 'Base Hybrid 4WD', conditionType: 'Used', price: 57900, mileageKm: 18400, fuelType: '2.4L i-FORCE MAX Hybrid', transmission: '8-Speed Automatic', drivetrain: 'Full-Time 4WD', powerHp: 326 },
      { year: 2023, model: 'Land Cruiser Prado', trim: 'VX-L Pearl White 4WD', conditionType: 'Used', price: 54500, mileageKm: 27900, fuelType: '2.8L Turbo Diesel', transmission: '6-Speed Automatic', drivetrain: 'Full-Time 4WD', powerHp: 201 },
      { year: 2022, model: 'Land Cruiser Prado', trim: 'TX-L 4WD Utility', conditionType: 'Used', price: 48900, mileageKm: 39200, fuelType: '2.7L Dual VVT-i Petrol', transmission: '6-Speed Automatic', drivetrain: 'Full-Time 4WD', powerHp: 163 },
      { year: 2021, model: 'Land Cruiser Prado', trim: 'GXR Sunroof Edition', conditionType: 'Used', price: 44600, mileageKm: 48500, fuelType: '4.0L V6 Petrol', transmission: '6-Speed Automatic', drivetrain: 'Full-Time 4WD', powerHp: 271 },
      { year: 2020, model: 'Land Cruiser Prado', trim: 'Kakadu Flagship 4WD', conditionType: 'Used', price: 41200, mileageKm: 56400, fuelType: '2.8L Turbo Diesel', transmission: '6-Speed Automatic', drivetrain: 'Full-Time 4WD', powerHp: 201 },
    ],
  },
  {
    slug: 'audi-a6-quattro',
    make: 'Audi',
    bodyStyle: 'Sedan',
    exteriorColor: 'Mythos Black Metallic',
    interiorTrim: 'Black Perforated Leather w/ Red Stitching',
    extFront: '/src/assets/images/car_audi_a6_sline_1795510213729.jpg',
    extFrontLabel: 'Front & Left View',
    extRear: '/src/assets/images/ext_rear_audi_a6_1795515350989.jpg',
    extRearLabel: 'Rear & Right View',
    extTrunk: '/src/assets/images/trunk_sedan_bay_1795517392969.jpg',
    extBonnet: '/src/assets/images/bonnet_audi_engine_1795517415238.jpg',
    extBonnetLabel: 'Bonnet & TFSI Bay',
    intFront: '/src/assets/images/reel_showroom_walkaround_1795509369876.jpg',
    summaryTemplate:
      'Mythos Black Metallic Audi A6 / S6 Quattro S-Line sedan paired with the flat-bottom perforated leather S-Line cockpit and dual MMI touchscreens.',
    features: [
      'HD Matrix-Design LED Headlights w/ Dynamic Indicators',
      'Audi Virtual Cockpit Plus & Dual MMI Touchscreens',
      'S-Line Flat-Bottom Perforated Leather Wheel',
      'Bang & Olufsen 3D Premium Sound System',
      '4-Zone Automatic Climate Control',
      'Top View 360-Degree Camera & Adaptive Cruise',
      '20-Inch 5-V-Spoke Graphite Gray S-Line Alloys',
      'Power Soft-Closing Doors & Panoramic Sunroof',
    ],
    variants: [
      { year: 2026, model: 'A6 55 TFSI Quattro', trim: 'S-Line Prestige Sedan', conditionType: 'Brand New', price: 66800, mileageKm: 12, fuelType: '3.0L V6 Turbo + 48V MHEV', transmission: '7-Speed S tronic', drivetrain: 'quattro AWD', powerHp: 335 },
      { year: 2026, model: 'A6 45 TFSI Quattro', trim: 'Premium Plus S-Line', conditionType: 'Brand New', price: 58900, mileageKm: 16, fuelType: '2.0L Turbo + 12V MHEV', transmission: '7-Speed S tronic', drivetrain: 'quattro AWD', powerHp: 261 },
      { year: 2026, model: 'S6 TFSI Quattro', trim: 'Black Optic Executive', conditionType: 'Brand New', price: 79400, mileageKm: 10, fuelType: '2.9L Twin-Turbo V6', transmission: '8-Speed Tiptronic', drivetrain: 'quattro Sport AWD', powerHp: 444 },
      { year: 2025, model: 'A6 55 TFSI Quattro', trim: 'Black Optic Prestige', conditionType: 'Brand New', price: 63900, mileageKm: 19, fuelType: '3.0L V6 Turbo + 48V MHEV', transmission: '7-Speed S tronic', drivetrain: 'quattro AWD', powerHp: 335 },
      { year: 2025, model: 'A6 45 TFSI Quattro', trim: 'S-Line Convenience Pack', conditionType: 'Brand New', price: 55400, mileageKm: 23, fuelType: '2.0L Turbo + 12V MHEV', transmission: '7-Speed S tronic', drivetrain: 'quattro AWD', powerHp: 261 },
      { year: 2025, model: 'S6 TFSI Quattro', trim: 'Prestige Sport Differential', conditionType: 'Brand New', price: 76200, mileageKm: 15, fuelType: '2.9L Twin-Turbo V6', transmission: '8-Speed Tiptronic', drivetrain: 'quattro Sport AWD', powerHp: 444 },
      { year: 2024, model: 'A6 55 TFSI Quattro', trim: 'S-Line Prestige Sedan', conditionType: 'Used', price: 52400, mileageKm: 13200, fuelType: '3.0L V6 Turbo + 48V MHEV', transmission: '7-Speed S tronic', drivetrain: 'quattro AWD', powerHp: 335 },
      { year: 2024, model: 'A6 45 TFSI Quattro', trim: 'Premium Plus Sedan', conditionType: 'Used', price: 45900, mileageKm: 16800, fuelType: '2.0L Turbo + 12V MHEV', transmission: '7-Speed S tronic', drivetrain: 'quattro AWD', powerHp: 261 },
      { year: 2023, model: 'A6 55 TFSI Quattro', trim: 'Prestige Executive', conditionType: 'Used', price: 47200, mileageKm: 24100, fuelType: '3.0L V6 Turbo + 48V MHEV', transmission: '7-Speed S tronic', drivetrain: 'quattro AWD', powerHp: 335 },
      { year: 2023, model: 'S6 TFSI Quattro', trim: 'S Sport Package', conditionType: 'Used', price: 59800, mileageKm: 21500, fuelType: '2.9L Twin-Turbo V6', transmission: '8-Speed Tiptronic', drivetrain: 'quattro Sport AWD', powerHp: 444 },
      { year: 2022, model: 'A6 45 TFSI Quattro', trim: 'S-Line Black Optic', conditionType: 'Used', price: 38900, mileageKm: 34900, fuelType: '2.0L Turbo + 12V MHEV', transmission: '7-Speed S tronic', drivetrain: 'quattro AWD', powerHp: 261 },
      { year: 2021, model: 'A6 55 TFSI Quattro', trim: 'Technik S-Line', conditionType: 'Used', price: 36400, mileageKm: 42300, fuelType: '3.0L V6 Turbo + 48V MHEV', transmission: '7-Speed S tronic', drivetrain: 'quattro AWD', powerHp: 335 },
    ],
  },
  {
    slug: 'bmw-3-series',
    make: 'BMW',
    bodyStyle: 'Sedan',
    exteriorColor: 'Tanzanite Blue II Metallic',
    interiorTrim: 'Black Vernasca Leather w/ Contrast Stitching',
    extFront: '/src/assets/images/car_bmw_m340i_1795509368578.jpg',
    extFrontLabel: 'Front & Left View',
    extRear: '/src/assets/images/ext_rear_bmw_m340i_1795515350142.jpg',
    extRearLabel: 'Rear & Right View',
    extTrunk: '/src/assets/images/trunk_sedan_bay_1795517392969.jpg',
    extBonnet: '/src/assets/images/bonnet_turbo_engine_1795517393655.jpg',
    extBonnetLabel: 'Bonnet & TwinPower Bay',
    intFront: '/src/assets/images/int_bmw_m340i_1795510212273.jpg',
    intRear: '/src/assets/images/int_rear_bmw_m340i_1795515350219.jpg',
    summaryTemplate:
      'Tanzanite Blue II Metallic BMW 3 Series M Sport sedan featuring Black Vernasca leather seats, curved iDrive 8 dual panoramic display, and M Sport hardware.',
    features: [
      'M Sport Differential & Adaptive M Suspension',
      'BMW Curved Display (12.3" Cluster + 14.9" Central)',
      'Harman Kardon Surround Sound System',
      'Shadowline Exterior Trim & M Sport Brakes',
      'Head-Up Display & Wireless Charging Pad',
      'Driving Assistance Pro (Adaptive Cruise & Lane Keep)',
      '19-Inch Jet Black Double-Spoke Alloys',
      'Tri-Zone Automatic Climate Control',
    ],
    variants: [
      { year: 2026, model: 'M340i xDrive', trim: 'M Sport Shadowline Pro', conditionType: 'Brand New', price: 62400, mileageKm: 12, fuelType: '3.0L TwinPower I6 + 48V', transmission: '8-Speed Sport Steptronic', drivetrain: 'xDrive AWD', powerHp: 386 },
      { year: 2026, model: '330i xDrive', trim: 'M Sport Package Sedan', conditionType: 'Brand New', price: 51200, mileageKm: 15, fuelType: '2.0L TwinPower Turbo + 48V', transmission: '8-Speed Steptronic', drivetrain: 'xDrive AWD', powerHp: 255 },
      { year: 2026, model: '330e xDrive', trim: 'M Sport Plug-In Hybrid', conditionType: 'Brand New', price: 54900, mileageKm: 18, fuelType: '2.0L Plug-In Hybrid', transmission: '8-Speed Steptronic', drivetrain: 'xDrive AWD', powerHp: 288 },
      { year: 2025, model: 'M340i Sedan', trim: 'Rear-Wheel M Performance', conditionType: 'Brand New', price: 59800, mileageKm: 14, fuelType: '3.0L TwinPower I6 + 48V', transmission: '8-Speed Sport Steptronic', drivetrain: 'Rear-Wheel Drive', powerHp: 386 },
      { year: 2025, model: '330i M Sport', trim: 'Premium Package Sedan', conditionType: 'Brand New', price: 48700, mileageKm: 20, fuelType: '2.0L TwinPower Turbo + 48V', transmission: '8-Speed Steptronic', drivetrain: 'Rear-Wheel Drive', powerHp: 255 },
      { year: 2025, model: 'M340i xDrive', trim: 'Executive Shadowline', conditionType: 'Brand New', price: 61500, mileageKm: 19, fuelType: '3.0L TwinPower I6 + 48V', transmission: '8-Speed Sport Steptronic', drivetrain: 'xDrive AWD', powerHp: 386 },
      { year: 2024, model: 'M340i xDrive', trim: 'M Sport Shadowline', conditionType: 'Used', price: 53900, mileageKm: 11800, fuelType: '3.0L TwinPower I6 + 48V', transmission: '8-Speed Sport Steptronic', drivetrain: 'xDrive AWD', powerHp: 382 },
      { year: 2024, model: '330i xDrive', trim: 'M Sport Package', conditionType: 'Used', price: 42400, mileageKm: 15200, fuelType: '2.0L TwinPower Turbo', transmission: '8-Speed Steptronic', drivetrain: 'xDrive AWD', powerHp: 255 },
      { year: 2023, model: 'M340i xDrive', trim: 'M Sport Shadowline', conditionType: 'Used', price: 49750, mileageKm: 21400, fuelType: '3.0L TwinPower I6 + 48V', transmission: '8-Speed Sport Steptronic', drivetrain: 'xDrive AWD', powerHp: 382 },
      { year: 2023, model: '330i xDrive', trim: 'Driving Assistance Pro', conditionType: 'Used', price: 38900, mileageKm: 26300, fuelType: '2.0L TwinPower Turbo', transmission: '8-Speed Steptronic', drivetrain: 'xDrive AWD', powerHp: 255 },
      { year: 2022, model: 'M340i xDrive', trim: 'Vernasca M Sport', conditionType: 'Used', price: 44600, mileageKm: 32900, fuelType: '3.0L TwinPower I6 + 48V', transmission: '8-Speed Sport Steptronic', drivetrain: 'xDrive AWD', powerHp: 382 },
      { year: 2021, model: '330i M Sport', trim: 'Shadowline Edition', conditionType: 'Used', price: 32800, mileageKm: 41700, fuelType: '2.0L TwinPower Turbo', transmission: '8-Speed Steptronic', drivetrain: 'Rear-Wheel Drive', powerHp: 255 },
    ],
  },
  {
    slug: 'lexus-rx',
    make: 'Lexus',
    bodyStyle: 'SUV',
    exteriorColor: 'Iridium Silver Metallic',
    interiorTrim: 'Black & Palomino Semi-Aniline Leather',
    extFront: '/src/assets/images/car_lexus_rx350h_1795510213948.jpg',
    extFrontLabel: 'Front & Right View',
    extRear: '/src/assets/images/ext_rear_lexus_rx_1795515351189.jpg',
    extRearLabel: 'Rear & Left View',
    extTrunk: '/src/assets/images/trunk_suv_bay_1795517393482.jpg',
    extBonnet: '/src/assets/images/bonnet_lexus_hybrid_1795517415994.jpg',
    extBonnetLabel: 'Bonnet & Hybrid Bay',
    intFront: '/src/assets/images/int_lexus_rx350h_1795510214312.jpg',
    summaryTemplate:
      'Iridium Silver Metallic Lexus RX luxury SUV featuring two-tone Black & Palomino semi-aniline leather cabin, 14-inch Lexus Interface touchscreen, and DIRECT4 AWD.',
    features: [
      '14-Inch Lexus Interface Touchscreen w/ Navigation',
      'Two-Tone Black & Palomino Semi-Aniline Leather',
      'Heated & Ventilated Power Front & Rear Seats',
      'Lexus Safety System+ 3.0 & Traffic Jam Assist',
      'Mark Levinson 21-Speaker PurePlay Surround',
      'Digital Latch with Safe Exit Assist',
      'Panoramic Glass Roof & Kick-Sensor Liftgate',
      '21-Inch Multi-Spoke Machined Luxury Wheels',
    ],
    variants: [
      { year: 2026, model: 'RX 350h Luxury', trim: 'Hybrid AWD', conditionType: 'Brand New', price: 59800, mileageKm: 14, fuelType: '2.5L Self-Charging Hybrid', transmission: 'Electronically Controlled CVT', drivetrain: 'DIRECT4 AWD', powerHp: 246 },
      { year: 2026, model: 'RX 500h F Sport', trim: 'Performance Direct4 AWD', conditionType: 'Brand New', price: 68900, mileageKm: 11, fuelType: '2.4L Turbo Hybrid', transmission: '6-Speed Direct Automatic', drivetrain: 'DIRECT4 AWD', powerHp: 366 },
      { year: 2026, model: 'RX 450h+ Luxury', trim: 'Plug-In Hybrid AWD', conditionType: 'Brand New', price: 72400, mileageKm: 16, fuelType: '2.5L Plug-In Hybrid', transmission: 'eCVT', drivetrain: 'E-Four AWD', powerHp: 304 },
      { year: 2025, model: 'RX 350h Luxury', trim: 'Mark Levinson Package', conditionType: 'Brand New', price: 57400, mileageKm: 19, fuelType: '2.5L Self-Charging Hybrid', transmission: 'eCVT', drivetrain: 'DIRECT4 AWD', powerHp: 246 },
      { year: 2025, model: 'RX 350 F Sport', trim: 'Handling Turbo AWD', conditionType: 'Brand New', price: 61200, mileageKm: 22, fuelType: '2.4L Turbo Inline-4', transmission: '8-Speed Automatic', drivetrain: 'All-Wheel Drive', powerHp: 275 },
      { year: 2025, model: 'RX 350 Luxury', trim: 'Executive Comfort Pack', conditionType: 'Brand New', price: 55900, mileageKm: 17, fuelType: '2.4L Turbo Inline-4', transmission: '8-Speed Automatic', drivetrain: 'All-Wheel Drive', powerHp: 275 },
      { year: 2024, model: 'RX 350h Luxury', trim: 'Hybrid AWD', conditionType: 'Used', price: 51400, mileageKm: 12900, fuelType: '2.5L Self-Charging Hybrid', transmission: 'eCVT', drivetrain: 'DIRECT4 AWD', powerHp: 246 },
      { year: 2024, model: 'RX 350 F Sport', trim: 'Handling Package AWD', conditionType: 'Used', price: 52900, mileageKm: 14700, fuelType: '2.4L Turbo Inline-4', transmission: '8-Speed Automatic', drivetrain: 'All-Wheel Drive', powerHp: 275 },
      { year: 2023, model: 'RX 350h Luxury', trim: 'Hybrid AWD', conditionType: 'Used', price: 46800, mileageKm: 26500, fuelType: '2.5L Self-Charging Hybrid', transmission: 'eCVT', drivetrain: 'DIRECT4 AWD', powerHp: 246 },
      { year: 2023, model: 'RX 500h F Sport', trim: 'Performance Hybrid', conditionType: 'Used', price: 56400, mileageKm: 21200, fuelType: '2.4L Turbo Hybrid', transmission: '6-Speed Direct Automatic', drivetrain: 'DIRECT4 AWD', powerHp: 366 },
      { year: 2022, model: 'RX 350 Luxury', trim: 'Panoramic Roof AWD', conditionType: 'Used', price: 41200, mileageKm: 34800, fuelType: '3.5L V6 Petrol', transmission: '8-Speed Automatic', drivetrain: 'All-Wheel Drive', powerHp: 295 },
      { year: 2021, model: 'RX 450h Luxury', trim: 'Hybrid V6 AWD', conditionType: 'Used', price: 39500, mileageKm: 42100, fuelType: '3.5L V6 Hybrid', transmission: 'eCVT', drivetrain: 'All-Wheel Drive', powerHp: 308 },
    ],
  },
  {
    slug: 'hyundai-ioniq5',
    make: 'Hyundai',
    bodyStyle: 'Crossover',
    exteriorColor: 'Shooting Star Matte Grey',
    interiorTrim: 'Dark Pebble Grey Eco-Processed Leather',
    extFront: '/src/assets/images/car_hyundai_ioniq5_1795509368466.jpg',
    extFrontLabel: 'Front & Left View',
    extRear: '/src/assets/images/ext_rear_ioniq5_1795515351877.jpg',
    extRearLabel: 'Rear & Right View',
    extTrunk: '/src/assets/images/trunk_suv_bay_1795517393482.jpg',
    intFront: '/src/assets/images/int_hyundai_ioniq5_1795510213003.jpg',
    summaryTemplate:
      'Shooting Star Matte Grey Hyundai Ioniq 5 crossover with Dark Pebble Grey cabin, dual 12.3-inch panoramic displays, and 800-volt ultra-fast charging.',
    features: [
      '800V Ultra-Fast Charging (10–80% in 18 Mins)',
      'Vision Panoramic Glass Roof with Power Shade',
      'Augmented Reality Head-Up Display',
      'Relaxation Zero-Gravity Driver Seat + Leg Rest',
      'Vehicle-to-Load (V2L) External Power Adapter',
      'Blind-Spot View Monitor & Remote Smart Park',
      'Bose 8-Speaker Premium Audio',
      '20-Inch Parametric Aero Alloy Wheels',
    ],
    variants: [
      { year: 2026, model: 'Ioniq 5 Limited', trim: 'Dual-Motor Long Range AWD', conditionType: 'Brand New', price: 52800, mileageKm: 12, fuelType: 'All-Electric (84 kWh)', transmission: 'Single-Speed Reduction Gear', drivetrain: 'HTRAC Dual-Motor AWD', powerHp: 320 },
      { year: 2026, model: 'Ioniq 5 XRT', trim: 'Off-Road All-Terrain AWD', conditionType: 'Brand New', price: 55400, mileageKm: 15, fuelType: 'All-Electric (84 kWh)', transmission: 'Single-Speed Reduction Gear', drivetrain: 'HTRAC Dual-Motor AWD', powerHp: 320 },
      { year: 2026, model: 'Ioniq 5 SEL', trim: 'Long Range RWD', conditionType: 'Brand New', price: 46900, mileageKm: 18, fuelType: 'All-Electric (84 kWh)', transmission: 'Single-Speed Reduction Gear', drivetrain: 'Rear-Wheel Drive', powerHp: 225 },
      { year: 2025, model: 'Ioniq 5 Limited', trim: 'Dual-Motor AWD', conditionType: 'Brand New', price: 50400, mileageKm: 16, fuelType: 'All-Electric (84 kWh)', transmission: 'Single-Speed Reduction Gear', drivetrain: 'HTRAC Dual-Motor AWD', powerHp: 320 },
      { year: 2025, model: 'Ioniq 5 N Line', trim: 'Sport Aero AWD', conditionType: 'Brand New', price: 53900, mileageKm: 14, fuelType: 'All-Electric (84 kWh)', transmission: 'Single-Speed Reduction Gear', drivetrain: 'HTRAC Dual-Motor AWD', powerHp: 320 },
      { year: 2025, model: 'Ioniq 5 SE', trim: 'Standard Range RWD', conditionType: 'Brand New', price: 42500, mileageKm: 20, fuelType: 'All-Electric (63 kWh)', transmission: 'Single-Speed Reduction Gear', drivetrain: 'Rear-Wheel Drive', powerHp: 168 },
      { year: 2024, model: 'Ioniq 5 Limited', trim: 'Dual-Motor Long Range AWD', conditionType: 'Used', price: 37900, mileageKm: 11200, fuelType: 'All-Electric (77.4 kWh)', transmission: 'Single-Speed Reduction Gear', drivetrain: 'HTRAC Dual-Motor AWD', powerHp: 320 },
      { year: 2024, model: 'Ioniq 5 SEL', trim: 'Dual-Motor AWD', conditionType: 'Used', price: 35400, mileageKm: 14600, fuelType: 'All-Electric (77.4 kWh)', transmission: 'Single-Speed Reduction Gear', drivetrain: 'HTRAC Dual-Motor AWD', powerHp: 320 },
      { year: 2023, model: 'Ioniq 5 Limited', trim: 'Vision Roof AWD', conditionType: 'Used', price: 34200, mileageKm: 19800, fuelType: 'All-Electric (77.4 kWh)', transmission: 'Single-Speed Reduction Gear', drivetrain: 'HTRAC Dual-Motor AWD', powerHp: 320 },
      { year: 2023, model: 'Ioniq 5 SE', trim: 'Long Range RWD', conditionType: 'Used', price: 29900, mileageKm: 24100, fuelType: 'All-Electric (77.4 kWh)', transmission: 'Single-Speed Reduction Gear', drivetrain: 'Rear-Wheel Drive', powerHp: 225 },
      { year: 2022, model: 'Ioniq 5 Limited', trim: 'First Edition AWD', conditionType: 'Used', price: 31500, mileageKm: 29400, fuelType: 'All-Electric (77.4 kWh)', transmission: 'Single-Speed Reduction Gear', drivetrain: 'HTRAC Dual-Motor AWD', powerHp: 320 },
      { year: 2022, model: 'Ioniq 5 SEL', trim: 'Long Range RWD', conditionType: 'Used', price: 27400, mileageKm: 34200, fuelType: 'All-Electric (77.4 kWh)', transmission: 'Single-Speed Reduction Gear', drivetrain: 'Rear-Wheel Drive', powerHp: 225 },
    ],
  },
];

function buildCondition(variant: VehicleVariantSpec, platform: VehiclePlatformTemplate): ConditionBreakdown {
  if (variant.conditionType === 'Brand New') {
    return {
      overallGrade: 'Factory New (Zero Owners)',
      exteriorScore: `10 / 10 — Original ${platform.exteriorColor} showroom finish`,
      interiorScore: `10 / 10 — Unwrapped ${platform.interiorTrim}`,
      mechanicalScore: '10 / 10 — Pre-Delivery Inspection (PDI) passed',
      historySummary: 'Direct showroom allocation with factory build sheet and 2 keys.',
      inspectionNote: 'Electrical, fluid, and manufacturer software check completed.',
    };
  }
  const scoreBase = variant.year >= 2024 ? '9.7' : variant.year === 2023 ? '9.5' : '9.3';
  return {
    overallGrade: variant.year >= 2024 ? 'Grade A+ — Low-Mileage Pre-Owned' : 'Grade A — Inspected Pre-Owned',
    exteriorScore: `${scoreBase} / 10 — Verified original ${platform.exteriorColor} paint`,
    interiorScore: `${scoreBase} / 10 — Clean ${platform.interiorTrim}, non-smoker cabin`,
    mechanicalScore: '9.8 / 10 — 60-point powertrain, OBD, and brake inspection passed',
    historySummary: 'Clean accident-free title, documented service history, and 2 keys.',
    inspectionNote: 'Independent paint-depth and road test completed at Morgan Car Hub.',
  };
}

export const CAR_INVENTORY: CarListing[] = (() => {
  const result: CarListing[] = [];
  let counter = 101;
  // Interleave across brands so featured default page shows diverse models immediately
  const maxVariants = 12;
  for (let vIdx = 0; vIdx < maxVariants; vIdx++) {
    for (const platform of VEHICLE_PLATFORMS) {
      const variant = platform.variants[vIdx];
      if (!variant) continue;
      const stockCode = `MCH-${counter}`;
      counter += 1;
      const id = `${platform.slug}-${variant.year}-${variant.conditionType === 'Brand New' ? 'new' : 'used'}-${counter}`;

      const gallery: GalleryMediaItem[] = [
        {
          id: `${id}-front`,
          angle: 'front',
          shortLabel: 'Front',
          label: platform.extFrontLabel ?? 'Front View',
          type: 'exterior',
          src: platform.extFront,
        },
        {
          id: `${id}-rear`,
          angle: 'rear',
          shortLabel: 'Rear',
          label: platform.extRearLabel ?? 'Rear View',
          type: 'exterior',
          src: platform.extRear,
        },
        ...(platform.extRight
          ? [
              {
                id: `${id}-right`,
                angle: 'right' as const,
                shortLabel: 'Right',
                label: 'Right Side Profile',
                type: 'exterior' as const,
                src: platform.extRight,
              },
            ]
          : []),
        {
          id: `${id}-trunk`,
          angle: 'trunk',
          shortLabel: 'Trunk',
          label: 'Open Trunk / Cargo Bay',
          type: 'exterior',
          src: platform.extTrunk,
        },
        ...(platform.extBonnet
          ? [
              {
                id: `${id}-bonnet`,
                angle: 'bonnet' as const,
                shortLabel: 'Bonnet',
                label: platform.extBonnetLabel ?? 'Open Bonnet / Engine',
                type: 'exterior' as const,
                src: platform.extBonnet,
              },
            ]
          : []),
        {
          id: `${id}-interior`,
          angle: 'interior',
          shortLabel: 'Cabin',
          label: 'Driver Cockpit',
          type: 'interior',
          src: platform.intFront,
        },
        ...(platform.intRear
          ? [
              {
                id: `${id}-cabin-rear`,
                angle: 'cabin' as const,
                shortLabel: 'Rear Seat',
                label: 'Rear Passenger Cabin',
                type: 'interior' as const,
                src: platform.intRear,
              },
            ]
          : []),
      ];

      result.push({
        id,
        stockCode,
        make: platform.make,
        model: variant.model,
        trim: variant.trim,
        year: variant.year,
        conditionType: variant.conditionType,
        bodyStyle: platform.bodyStyle,
        price: variant.price,
        mileageKm: variant.mileageKm,
        fuelType: variant.fuelType,
        transmission: variant.transmission,
        drivetrain: variant.drivetrain,
        powerHp: variant.powerHp,
        exteriorColor: platform.exteriorColor,
        interiorTrim: platform.interiorTrim,
        image: platform.extFront,
        interiorImage: platform.intFront,
        gallery,
        secondaryImages: gallery.map((g) => g.src),
        summary: `${variant.year} ${platform.make} ${variant.model} ${variant.trim} (${variant.conditionType}). ${platform.summaryTemplate}`,
        features: platform.features,
        condition: buildCondition(variant, platform),
      });
    }
  }
  return result;
})();

export const COMMERCIAL_SCENES: CommercialScene[] = [
  {
    id: 'scene-taycan',
    carId: CAR_INVENTORY[0].id,
    conditionType: 'Brand New',
    kicker: 'Brand New Showroom Arrival · 2026',
    headline: 'Electric Precision. Ready for Immediate Delivery.',
    caption: '2026 Porsche Taycan GTS · Chalk Metallic / Black Race-Tex · $138,900',
    image: '/src/assets/images/hero_taycan_commercial_1795509366473.jpg',
    interiorImage: '/src/assets/images/int_porsche_taycan_1795510210074.jpg',
    durationSec: 8,
  },
  {
    id: 'scene-rangerover',
    carId: CAR_INVENTORY[1].id,
    conditionType: 'Brand New',
    kicker: 'Brand New Flagship · 2026',
    headline: 'Command Every Mile with Modern Refinement.',
    caption: '2026 Land Rover Range Rover Sport Autobiography · Satin Gunmetal / Ebony · $118,500',
    image: '/src/assets/images/hero_rangerover_commercial_1795509370496.jpg',
    interiorImage: '/src/assets/images/int_range_rover_sport_1795510210242.jpg',
    durationSec: 8,
  },
  {
    id: 'scene-mustang',
    carId: CAR_INVENTORY[30].id,
    conditionType: 'Brand New',
    kicker: 'Brand New V8 Coupe · 2025',
    headline: 'Pure 5.0L V8 Character. Zero Delivery Wait.',
    caption: '2025 Ford Mustang GT Premium · Vapor Blue / Black Onyx · $51,900',
    image: '/src/assets/images/car_ford_mustang_gt_1795510215093.jpg',
    interiorImage: '/src/assets/images/int_ford_mustang_gt_1795510217124.jpg',
    durationSec: 8,
  },
  {
    id: 'scene-landcruiser',
    carId: CAR_INVENTORY[58].id,
    conditionType: 'Used',
    kicker: 'Inspected Pre-Owned · 14,800 km',
    headline: 'Certified Used Vehicles with Verified History.',
    caption: '2024 Toyota Land Cruiser 250 · Pearl White / Java Brown · $64,900',
    image: '/src/assets/images/car_land_cruiser_1795509367786.jpg',
    interiorImage: '/src/assets/images/int_toyota_land_cruiser_1795510212725.jpg',
    durationSec: 8,
  },
  {
    id: 'scene-audi-a6',
    carId: CAR_INVENTORY[59].id,
    conditionType: 'Used',
    kicker: 'Inspected Pre-Owned · 13,200 km',
    headline: 'Executive Quattro Luxury at Pre-Owned Value.',
    caption: '2024 Audi A6 55 TFSI Quattro · Mythos Black / S-Line Cockpit · $52,400',
    image: '/src/assets/images/car_audi_a6_sline_1795510213729.jpg',
    interiorImage: '/src/assets/images/reel_showroom_walkaround_1795509369876.jpg',
    durationSec: 8,
  },
  {
    id: 'scene-lexus-rx',
    carId: CAR_INVENTORY[79].id,
    conditionType: 'Used',
    kicker: 'Inspected Hybrid SUV · 26,500 km',
    headline: 'Honest Pricing Across Brand New and Used Stock.',
    caption: '2023 Lexus RX 350h Luxury · Iridium Silver / Palomino Leather · $46,800',
    image: '/src/assets/images/car_lexus_rx350h_1795510213948.jpg',
    interiorImage: '/src/assets/images/int_lexus_rx350h_1795510214312.jpg',
    durationSec: 8,
  },
];

export const TIKTOK_REELS: TikTokReel[] = [
  {
    id: 'reel-taycan-new',
    title: '2026 Porsche Taycan GTS Delivery Tour',
    subtitle: 'Chalk Metallic exterior and Race-Tex Sport Chrono cockpit inspection straight off delivery.',
    duration: '0:46',
    featuredCar: '2026 Porsche Taycan GTS',
    make: 'Porsche',
    year: 2026,
    price: 138900,
    conditionType: 'Brand New',
    carId: CAR_INVENTORY[0].id,
    coverImage: '/src/assets/images/hero_taycan_commercial_1795509366473.jpg',
    interiorImage: '/src/assets/images/int_porsche_taycan_1795510210074.jpg',
    highlights: ['Chalk Metallic finish', 'Porsche Race-Tex cabin', '800V fast-charge port check'],
  },
  {
    id: 'reel-c300-new',
    title: '2025 Mercedes-Benz C300 AMG Walkaround',
    subtitle: 'Obsidian Black exterior paired with Sienna Brown cabin and portrait MBUX startup.',
    duration: '0:52',
    featuredCar: '2025 Mercedes-Benz C300 AMG Line',
    make: 'Mercedes-Benz',
    year: 2025,
    price: 54800,
    conditionType: 'Brand New',
    carId: CAR_INVENTORY[29].id,
    coverImage: '/src/assets/images/car_mercedes_c300_1795509367136.jpg',
    interiorImage: '/src/assets/images/int_mercedes_c300_1795510210395.jpg',
    highlights: ['AMG Line star grille', 'Sienna Brown MB-Tex seats', 'MBUX ambient light demo'],
  },
  {
    id: 'reel-mustang-new',
    title: '2025 Ford Mustang GT 5.0L Cold Start',
    subtitle: 'Vapor Blue Metallic coupe exterior and Black Onyx 6-speed manual cockpit tour.',
    duration: '0:44',
    featuredCar: '2025 Ford Mustang GT Premium',
    make: 'Ford',
    year: 2025,
    price: 51900,
    conditionType: 'Brand New',
    carId: CAR_INVENTORY[30].id,
    coverImage: '/src/assets/images/car_ford_mustang_gt_1795510215093.jpg',
    interiorImage: '/src/assets/images/int_ford_mustang_gt_1795510217124.jpg',
    highlights: ['480 hp 5.0L V8 exhaust', '6-speed manual shifter', 'Dual curved SYNC 4 screen'],
  },
  {
    id: 'reel-audi-used',
    title: '2024 Audi A6 S-Line Cockpit & Paint Check',
    subtitle: 'Inside our Mythos Black Audi A6 Quattro showing the red-stitched S-Line wheel and dual MMI.',
    duration: '0:55',
    featuredCar: '2024 Audi A6 55 TFSI Quattro',
    make: 'Audi',
    year: 2024,
    price: 52400,
    conditionType: 'Used',
    carId: CAR_INVENTORY[59].id,
    coverImage: '/src/assets/images/car_audi_a6_sline_1795510213729.jpg',
    interiorImage: '/src/assets/images/reel_showroom_walkaround_1795509369876.jpg',
    highlights: ['Mythos Black paint reading', 'S-Line perforated cockpit', '13,200 km verified log'],
  },
  {
    id: 'reel-m340i-used',
    title: '2023 BMW M340i xDrive 60-Point Check',
    subtitle: 'Tanzanite Blue exterior, iDrive 8 cabin check, and B58 inline-six inspection at @cheap_cars49.',
    duration: '0:49',
    featuredCar: '2023 BMW M340i xDrive',
    make: 'BMW',
    year: 2023,
    price: 49750,
    conditionType: 'Used',
    carId: CAR_INVENTORY[78].id,
    coverImage: '/src/assets/images/car_bmw_m340i_1795509368578.jpg',
    interiorImage: '/src/assets/images/int_bmw_m340i_1795510212273.jpg',
    highlights: ['Tanzanite Blue bodywork', 'Vernasca leather & iDrive 8', '85% brake pad verification'],
  },
  {
    id: 'reel-rx350h-used',
    title: '2023 Lexus RX 350h Hybrid Luxury Tour',
    subtitle: 'Iridium Silver exterior and Palomino two-tone interior walkthrough with hybrid battery readout.',
    duration: '0:51',
    featuredCar: '2023 Lexus RX 350h Luxury',
    make: 'Lexus',
    year: 2023,
    price: 46800,
    conditionType: 'Used',
    carId: CAR_INVENTORY[79].id,
    coverImage: '/src/assets/images/car_lexus_rx350h_1795510213948.jpg',
    interiorImage: '/src/assets/images/int_lexus_rx350h_1795510214312.jpg',
    highlights: ['Iridium Silver finish', 'Palomino & Black cabin', 'Hybrid system health 100%'],
  },
];

export const CUSTOMER_TESTIMONIALS: CustomerTestimonial[] = [
  {
    id: 'testimonial-1',
    customerName: 'Customer Name 01 (Placeholder)',
    avatarInitials: 'C1',
    location: 'Austin, TX, USA',
    buyerRole: 'Business Owner · Verified Buyer',
    purchasedCar: '2024 Toyota Land Cruiser 250 First Edition',
    carId: CAR_INVENTORY[58].id,
    conditionType: 'Used',
    rating: 5,
    quote:
      'I was hesitant buying a used SUV remotely, so I requested the paint-depth readings and an unedited cold-start clip on WhatsApp. Every panel and the Java Brown cabin matched the photos exactly, and I locked the unit with a card deposit the same afternoon.',
  },
  {
    id: 'testimonial-2',
    customerName: 'Customer Name 02 (Placeholder)',
    avatarInitials: 'C2',
    location: 'London, United Kingdom',
    buyerRole: 'Operations Director · Fleet Upgrade',
    purchasedCar: '2025 Mercedes-Benz C300 AMG Line',
    carId: CAR_INVENTORY[29].id,
    conditionType: 'Brand New',
    rating: 5,
    quote:
      'Finding an unregistered C300 with the exact Sienna Brown interior usually meant weeks of waiting. Morgan Car Hub shared the full build sheet on Telegram, handled the export documentation cleanly, and delivered on schedule.',
  },
  {
    id: 'testimonial-3',
    customerName: 'Customer Name 03 (Placeholder)',
    avatarInitials: 'C3',
    location: 'Dubai, UAE',
    buyerRole: 'Software Consultant · EV Buyer',
    purchasedCar: '2024 Hyundai Ioniq 5 Limited AWD',
    carId: CAR_INVENTORY[62].id,
    conditionType: 'Used',
    rating: 5,
    quote:
      'What won me over from @cheap_cars49 on TikTok was the 99% battery State of Health readout and transparent pricing. The preset WhatsApp inquiry made checking availability effortless, and the car arrived spotless.',
  },
];
