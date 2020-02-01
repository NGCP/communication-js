/**
 * Type declaration for all tasks. See the following URL for the list of tasks:
 * https://ground-control-station.readthedocs.io/en/latest/communications/jobs.html#list-of-tasks
 */

interface TaskTypeBase {
  taskType: 'takeoff' | 'loiter' | 'isrSearch' | 'payloadDrop' | 'land' | 'retrieveTarget'
  | 'deliverTarget' | 'quickScan' | 'detailedSearch';
}

export interface TakeoffTask extends TaskTypeBase {
  taskType: 'takeoff';
  lat: number;
  lng: number;
  alt: number;
  loiter: {
    lat: number;
    lng: number;
    alt: number;
    radius: number;
    direction: number;
  };
}

export interface LoiterTask extends TaskTypeBase {
  taskType: 'loiter';
  lat: number;
  lng: number;
  alt: number;
  radius: number;
  direction: number;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface ISRSearchTask extends TaskTypeBase {
  taskType: 'isrSearch';
  alt: number;
  waypoints: [
    {
      lat: number;
      lng: number;
    },
    {
      lat: number;
      lng: number;
    },
    {
      lat: number;
      lng: number;
    }
  ];
}

export interface PayloadDropTask extends TaskTypeBase {
  taskType: 'payloadDrop';
  waypoints: [
    {
      lat: number;
      lng: number;
      alt: number;
    },
    {
      lat: number;
      lng: number;
      alt: number;
    }
  ];
}

export interface LandTask extends TaskTypeBase {
  taskType: 'land';
  waypoints: [
    {
      lat: number;
      lng: number;
      alt: number;
    },
    {
      lat: number;
      lng: number;
      alt: number;
    }
  ];
}

export interface UGVRetrieveTargetTask extends TaskTypeBase {
  taskType: 'retrieveTarget';
  lat: number;
  lng: number;
}

export interface DeliverTargetTask extends TaskTypeBase {
  taskType: 'deliverTarget';
  lat: number;
  lng: number;
}

export interface QuickScanTask extends TaskTypeBase {
  taskType: 'quickScan';
  waypoints: [
    {
      lat: number;
      lng: number;
    },
    {
      lat: number;
      lng: number;
    },
    {
      lat: number;
      lng: number;
    },
    {
      lat: number;
      lng: number;
    }
  ];
}


export interface DetailedSearchTask extends TaskTypeBase {
  taskType: 'detailedSearch';
  lat: number;
  lng: number;
}

export type Task = TakeoffTask | LoiterTask | ISRSearchTask | PayloadDropTask | LandTask
| UGVRetrieveTargetTask | DeliverTargetTask | QuickScanTask | DetailedSearchTask;
