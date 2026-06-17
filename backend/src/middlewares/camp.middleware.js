export const enforceCamp = (req, res, next) => {
  // admi global
  if (!req.user.camp_id) {
    return next();
  }

  // insert camp
  req.camp_id = req.user.camp_id;

  next();
};
