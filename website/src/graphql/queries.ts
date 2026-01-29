// Placeholder for GraphQL queries
// These will be properly implemented in later steps

export const getModel = `query GetModel($modelId: ID!) {
  getModel(modelId: $modelId) {
    modelId
    modelName
    username
  }
}`;

export const listModels = `query ListModels {
  listModels {
    items {
      modelId
      modelName
      username
    }
  }
}`;

export const getCarLog = `query GetCarLog($carLogId: ID!) {
  getCarLog(carLogId: $carLogId) {
    carLogId
    username
  }
}`;

export const listCarLogs = `query ListCarLogs {
  listCarLogs {
    items {
      carLogId
      username
    }
  }
}`;

export const listEvents = `query ListEvents {
  listEvents {
    items {
      eventId
      eventName
    }
  }
}`;

export const getCar = `query GetCar($carId: ID!) {
  getCar(carId: $carId) {
    carId
    carName
  }
}`;

export const listCars = `query ListCars {
  listCars {
    items {
      carId
      carName
    }
  }
}`;

export const listFetchesFromCar = `query ListFetchesFromCar {
  listFetchesFromCar {
    items {
      id
    }
  }
}`;

export const getUploadModelToCarStatus = `query GetUploadModelToCarStatus($id: ID!) {
  getUploadModelToCarStatus(id: $id) {
    id
    status
  }
}`;

export const getEvents = `query GetEvents {
  getEvents {
    eventId
    eventName
    trackId
    countryCode
  }
}`;

export const listUploadsToCar = `query ListUploadsToCar {
  listUploadsToCar {
    items {
      id
      status
      carId
      modelId
    }
  }
}`;

export const listUsers = `query ListUsers {
  listUsers {
    items {
      userId
      username
      email
    }
  }
}`;

export const listGroups = `query ListGroups {
  listGroups {
    items {
      groupId
      groupName
    }
  }
}`;

export const getAllFleets = `query GetAllFleets {
  getAllFleets {
    items {
      fleetId
      fleetName
    }
  }
}`;

export const getLeaderboard = `query GetLeaderboard($eventId: ID!) {
  getLeaderboard(eventId: $eventId) {
    eventId
    leaderboard
  }
}`;

export const getRaces = `query GetRaces($eventId: ID!) {
  getRaces(eventId: $eventId) {
    items {
      raceId
      eventId
      raceName
    }
  }
}`;

export const getAllModels = `query GetAllModels {
  getAllModels {
    items {
      modelId
      modelName
      username
    }
  }
}`;

export const getAllCarLogsAssets = `query GetAllCarLogsAssets {
  getAllCarLogsAssets {
    items {
      carLogId
      username
      status
    }
  }
}`;

export const carPrintableLabel = `query CarPrintableLabel($carId: ID!) {
  carPrintableLabel(carId: $carId) {
    carId
    label
  }
}`;

export const availableTaillightColors = `query AvailableTaillightColors {
  availableTaillightColors {
    colors
  }
}`;
