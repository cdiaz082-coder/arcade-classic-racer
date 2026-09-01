export interface VehicleStats {
  id: string;
  name: string;
  maxSpeed: number;
  acceleration: number;
  braking: number;
  turnSpeed: number;
  grip: number;          // Coeficiente de tracción (0.1 a 1.0)
  maxOilCapacity: number;
  color: string;
  unlockedByDefault: boolean;
  unlockCost: number;
}

export const VEHICLE_PRESETS: Record<string, VehicleStats> = {
  STREET_CRUISER: {
    id: 'STREET_CRUISER',
    name: 'Street Cruiser',
    maxSpeed: 280,
    acceleration: 320,
    braking: 400,
    turnSpeed: 3.2,
    grip: 0.85,
    maxOilCapacity: 5,
    color: '#3498db',
    unlockedByDefault: true,
    unlockCost: 0
  },
  APEX_DRIFTER: {
    id: 'APEX_DRIFTER',
    name: 'Apex Drifter',
    maxSpeed: 330,
    acceleration: 380,
    braking: 350,
    turnSpeed: 3.8,
    grip: 0.65,
    maxOilCapacity: 8,
    color: '#e74c3c',
    unlockedByDefault: false,
    unlockCost: 1500
  },
  ENFORCER_INTERCEPTOR: {
    id: 'ENFORCER_INTERCEPTOR',
    name: 'Enforcer Interceptor',
    maxSpeed: 310,
    acceleration: 450,
    braking: 500,
    turnSpeed: 2.9,
    grip: 0.95,
    maxOilCapacity: 10,
    color: '#2ecc71',
    unlockedByDefault: false,
    unlockCost: 3500
  },
  PHANTOM_RACER: {
    id: 'PHANTOM_RACER',
    name: 'Phantom Racer',
    maxSpeed: 380,
    acceleration: 500,
    braking: 450,
    turnSpeed: 4.2,
    grip: 0.80,
    maxOilCapacity: 12,
    color: '#9b59b6',
    unlockedByDefault: false,
    unlockCost: 7500
  }
};
