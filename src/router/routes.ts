export enum USER_ROUTES {
  CREATE_ACCOUNT = '/register',
  LOGIN = '/login',
  REQUEST_PASSWORD_RESET = '/request-password-reset',
  RESET_PASSWORD = '/reset-password',
  GENERATE_ACCOUNT = '/make-user',
  USER_ID = '/user/:id',
  USER_TOKEN = '/user/:token',
  COMPLETE_REGISTRATION = '/complete-registration/:generatedId',
  ASSIGN_STAND_IN = '/assign-stand-in/:owner_id',
  GET_STAND_IN = '/stand-in/:owner_id',
  DELETE_STAND_IN = '/stand-in',
  ADD_TRADE = '/add-trade/:owner_id/:tradeId',
  ASSIGN_EMPLOYEE = '/assign_employee/:owner_id/:tradeId',
  DELETE_BANK_DETAILS = '/delete-bank-details/:owner_id',
  REMOVE_TRADES = '/remove-trades/:owner_id/:tradeId',
  DELETE_EMPLOYEE = '/delete-employee/:ownerId/:employee_id',
  RETRIEVE_EMPLOYEE = '/employee/:owner_id',
  UPDATE_BANK_DETAILS = '/update-bank/:owner_id',
}

export enum TRADE_ROUTES {
  TRADE = '/trade',
  GET_TRADE = '/trade/:id'
}