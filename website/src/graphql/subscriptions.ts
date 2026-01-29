// Placeholder for GraphQL subscriptions
// These will be properly implemented in later steps

export const onCreateModel = `subscription OnCreateModel {
  onCreateModel {
    modelId
    modelName
    username
  }
}`;

export const onUpdateModel = `subscription OnUpdateModel {
  onUpdateModel {
    modelId
    modelName
    username
  }
}`;

export const onDeleteModel = `subscription OnDeleteModel {
  onDeleteModel {
    modelId
    modelName
    username
  }
}`;

export const onCreateCarLog = `subscription OnCreateCarLog {
  onCreateCarLog {
    carLogId
    username
  }
}`;

export const onUpdateCarLog = `subscription OnUpdateCarLog {
  onUpdateCarLog {
    carLogId
    username
  }
}`;

export const onDeleteCarLog = `subscription OnDeleteCarLog {
  onDeleteCarLog {
    carLogId
    username
  }
}`;

export const onCreateCar = `subscription OnCreateCar {
  onCreateCar {
    carId
    carName
  }
}`;

export const onUpdateCar = `subscription OnUpdateCar {
  onUpdateCar {
    carId
    carName
  }
}`;

export const onDeleteCar = `subscription OnDeleteCar {
  onDeleteCar {
    carId
    carName
  }
}`;

export const onFetchesFromCarCreated = `subscription OnFetchesFromCarCreated {
  onFetchesFromCarCreated {
    id
  }
}`;

export const onFetchesFromCarUpdated = `subscription OnFetchesFromCarUpdated {
  onFetchesFromCarUpdated {
    id
  }
}`;

export const onUploadsToCarCreated = `subscription OnUploadsToCarCreated {
  onUploadsToCarCreated {
    id
  }
}`;

export const onUploadsToCarUpdated = `subscription OnUploadsToCarUpdated {
  onUploadsToCarUpdated {
    id
  }
}`;

export const onAddedEvent = `subscription OnAddedEvent {
  onAddedEvent {
    eventId
    eventName
  }
}`;

export const onUpdatedEvent = `subscription OnUpdatedEvent {
  onUpdatedEvent {
    eventId
    eventName
  }
}`;

export const onDeletedEvents = `subscription OnDeletedEvents {
  onDeletedEvents
}`;

export const onAddedRace = `subscription OnAddedRace {
  onAddedRace {
    raceId
    eventId
    raceName
  }
}`;

export const onUpdatedRace = `subscription OnUpdatedRace {
  onUpdatedRace {
    raceId
    eventId
    raceName
  }
}`;

export const onDeletedRaces = `subscription OnDeletedRaces {
  onDeletedRaces
}`;

export const onAddedFleet = `subscription OnAddedFleet {
  onAddedFleet {
    fleetId
    fleetName
  }
}`;

export const onUpdatedFleet = `subscription OnUpdatedFleet {
  onUpdatedFleet {
    fleetId
    fleetName
  }
}`;

export const onDeletedFleets = `subscription OnDeletedFleets {
  onDeletedFleets
}`;

export const onAddedModel = `subscription OnAddedModel {
  onAddedModel {
    modelId
    modelName
    username
  }
}`;

export const onUpdatedModel = `subscription OnUpdatedModel {
  onUpdatedModel {
    modelId
    modelName
    username
  }
}`;

export const onDeletedModel = `subscription OnDeletedModel {
  onDeletedModel {
    modelId
    modelName
    username
  }
}`;

export const onAddedCarLogsAsset = `subscription OnAddedCarLogsAsset {
  onAddedCarLogsAsset {
    carLogId
    username
  }
}`;

export const onDeletedCarLogsAsset = `subscription OnDeletedCarLogsAsset {
  onDeletedCarLogsAsset {
    carLogId
    username
  }
}`;

export const onNewLeaderboardEntry = `subscription OnNewLeaderboardEntry {
  onNewLeaderboardEntry {
    eventId
    leaderboard
  }
}`;

export const onNewOverlayInfo = `subscription OnNewOverlayInfo {
  onNewOverlayInfo {
    overlayInfo
  }
}`;

export const onUpdatedCarsInfo = `subscription OnUpdatedCarsInfo {
  onUpdatedCarsInfo {
    carId
    carInfo
  }
}`;

export const onUserCreated = `subscription OnUserCreated {
  onUserCreated {
    userId
    username
    email
  }
}`;

export const onUserUpdated = `subscription OnUserUpdated {
  onUserUpdated {
    userId
    username
    email
  }
}`;
