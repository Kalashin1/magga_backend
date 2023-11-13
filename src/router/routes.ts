export enum USER_ROUTES {
  CREATE_ACCOUNT = '/register',
  LOGIN = '/login',
  REQUEST_PASSWORD_RESET = '/request-password-reset',
  RESET_PASSWORD = '/reset-password',
  GENERATE_ACCOUNT = '/make-user',
  USER_ID = '/user/:id',
  GET_USER_BY_ID = '/user/id/:id',
  USER_TOKEN = '/user/:token',
  COMPLETE_REGISTRATION = '/complete-registration/:generatedId',
  ASSIGN_STAND_IN = '/assign-stand-in/:owner_id',
  GET_STAND_IN = '/stand-in/:owner_id',
  DELETE_STAND_IN = '/stand-in',
  ADD_TRADE = '/add-trade/:owner_id/:tradeId',
  DELETE_BANK_DETAILS = '/delete-bank-details/:owner_id',
  REMOVE_TRADES = '/remove-trades/:owner_id/:tradeId',
  ASSIGN_EMPLOYEE = '/assign_employee/:owner_id/:employee_id',
  DELETE_EMPLOYEE = '/delete-employee/:ownerId/:employee_id',
  RETRIEVE_EMPLOYEE = '/employee/:owner_id',
  ASSIGN_EXECUTOR = '/assign_executor/:owner_id/:executor_id',
  DELETE_EXECUTOR = '/delete-executor/:ownerId/:executor_id',
  RETRIEVE_EXECUTOR = '/executor/:owner_id',
  UPDATE_BANK_DETAILS = '/update-bank/:owner_id',
  ASSIGN_OWNER = '/assign/owner/:owner_id/:subAccount_id',
  GET_CONTRACTORS = '/contractors',
  UPDATE_DOCUMENT = '/update/document/'
}

export enum TRADE_ROUTES {
  TRADE = '/trade',
  GET_TRADE = '/trade/:id',

}

export enum BUCKET_ROUTES {
  BUCKETS = '/buckets',
  TEST_UPLOAD = '/test-upload',
  PROFILE_PHOTO = '/profile-photo/:_id',
  DOCUMENT = '/document/:_id/:document',
  LOGO_URL = '/logo_url/:_id/:logoType',
  EMPLOYEES_FOLDER = '/users/folders/:role',
  GET_FILE = '/files/',
  OWNER_EMPLOYEE = '/owner/employee/:owner_id',
  OWNER_EXECUTORS = '/owner/executor/:owner_id',
  UPLOAD_PROJECT = '/project/upload/:id',
  UPLOAD_POSITION_DOCUMENT = '/project/position/:id/:trade/:position'
}

export enum NOTIFICATION_ROUTES {
  NOTIFICATION = '/notification/id/:id',
  USER_NOTIFICATION = '/notification/user/:user_id',
}

export enum CONTRACT_ROUTES {
  CONTRACT = '/contract',
  ACCEPT_CONTRACT = '/contract/accept',
  REJECT_CONTRACT = '/contract/reject',
  CONTRACT_BY_ID = '/contract/id/:id',
  TERMINATE_CONTRACT = '/contract/terminate'
}

export enum POSITION_ROUTES {
  POSITION_BY_TRADE = '/position/trade/:trade_id',
  POSITION_BY_ID = '/position/id/:id',
  POSITION_BY_FILES = '/position/upload/:user_id',
  DELETE_POSTION = '/position'
}

export enum PROJECT_ROUTES {
  CREATE_PROJECT = '/project/create',
  PROJECT_BY_ID = '/project/id/:id',
  PROJECT_BY_EXTERNAL_ID = '/project/external/:id',
  ALL_PROJECTS = '/projects',
  EXECUTOR_PROJECTS = '/projects/executor/:id',
  CONTRACTOR_PROJECTS = '/projects/contractor/:id',
  PROJECT_STATUS = '/project/status/:status',
  ASSIGN_EXECUTOR = '/project/executor/:id',
  UPDATE_PROJECT = '/project/update/:id',
  ADD_POSITION = '/project/position/:id',
  ADD_EXTRA_POSITION = '/project/extra/:id',
  ADD_SHORTAGE_POSITION = '/project/shortage/:id',
  UPDATE_PROJECT_POSITION = '/project/update-position/:id',
  UPDATE_EXTRA_POSITION = '/project/update-extra/:id',
  UPDATE_SHORTAGE_POSITION = '/project/update-shortage/:id',
  ACCEPT_PROJECT = '/project/accept',
  REJECT_PROJECT = '/project/reject',
  UPDATE_MULTIPLE_POSITIONS_BY_TRADE = '/project/postitions/:id'
}

export enum DRAFT_ROUTES {
  CREATE = '/draft/create',
  DRAFT = '/draft/:id',
  USER_DRAFT = '/draft/user/:user_id',
  UPDATE_DRAFT = '/draft/update/:draft_id'
}

export enum INVOICE_ROUTES {
  CREATE = '/invoice/create',
  GET_USER_INVOICE = '/invoice/owner/:owner_id/:status',
  GET_RECIEVER_INVOICE = '/invoice/reciever/:user_id/:status',
  GET_INVOICE_BY_ID = '/invoice/id/:id',
  GET_INVOICE_BY_EXTERNAL_ID = '/invoice/external_id/:external_id'
}

export enum MESSAGE_ROUTES {
  CREATE = '/message/create',
  MESSAGE_BY_PROJECT_ID = '/message/project/:project_id'
}