export type HazardType = 'accident' | 'pothole' | 'checkpoint' | 'flooding';

// 'camera' covers every fixed point from the road database; 'hazard' is a community report.
export type AlertKind = 'camera' | 'hazard';

// Speed cameras (fixed / average / red light) plus the other fixed points the
// Egypt road database lists: police posts, speed bumps and speed-bump zones.
export type CameraType = 'fixed' | 'average' | 'red_light' | 'police' | 'speed_bump' | 'bump_zone';
