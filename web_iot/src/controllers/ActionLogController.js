const ActionLog = require('../models/ActionLog');

const ActionLogController = {
  getAllLogs: async (req, res) => {
    try {
      const { page, page_size, from, to } = req.query;

      const { result, pagination, filters } = await ActionLog.getActionLog({
        page: page ? parseInt(page) : null,       
        page_size: page_size ? parseInt(page_size) : null,
        from: from || null,
        to: to || null
      });

      // const historyData = JSON.stringify(result);
      // console.log(historyData)
      res.render("actions_log", { historyData: result, pagination, filters });
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
};

module.exports = ActionLogController;
