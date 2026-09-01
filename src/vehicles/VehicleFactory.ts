import { VehicleStats, VEHICLE_PRESETS } from './VehicleConfig';

export class VehicleFactory {
  public static getVehicleList(): VehicleStats[] {
    return Object.values(VEHICLE_PRESETS);
  }

  public static getVehicleById(id: string): VehicleStats {
    if (VEHICLE_PRESETS[id]) {
      return { ...VEHICLE_PRESETS[id] };
    }
    return { ...VEHICLE_PRESETS.STREET_CRUISER };
  }
}
