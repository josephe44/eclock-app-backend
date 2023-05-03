import status from "http-status";

// read this docs to see list of all status code
// https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml

export const successfulRequest = ({ res, message, entity, data, token }) => {
  res.status(status.OK).send({
    status: true,
    message,
    entity,
    token,
    data,
  });
};

export const resourceCreated = ({ res, message, entity, data, token }) => {
  res.status(status.CREATED).send({
    status: true,
    message,
    entity,
    token,
    data,
  });
};

export const badRequest = ({ res, message, error }) => {
  res.status(status.BAD_REQUEST).send({
    status: false,
    message,
    error,
  });
};

export const notAllowed = ({ res, message, error }) => {
  res.status(status.METHOD_NOT_ALLOWED).send({
    status: false,
    message,
    error,
  });
};

export const notFound = ({ res, message }) => {
  res.status(status.NOT_FOUND).send({
    status: false,
    message,
  });
};

const responses = {
  successfulRequest,
  badRequest,
  notAllowed,
  resourceCreated,
  notFound,
};

export default responses;
