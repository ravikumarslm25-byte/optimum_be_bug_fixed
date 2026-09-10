import IdcodeServices from "./idcode.service.js";

// GET /idcode — list all counters (seeds the standard set on first call)
export const listIdCodes = async (req, res) => {
  try {
    const data = await IdcodeServices.listCodes();
    res.status(200).json({ status: true, data });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// PUT /idcode/:idname — update prefix / current number / padding
export const updateIdCode = async (req, res) => {
  try {
    const { idname } = req.params;
    const data = await IdcodeServices.updateConfig(idname, req.body);
    res.status(200).json({ status: true, message: "ID counter updated", data });
  } catch (error) {
    const code = /not found/i.test(error.message) ? 404 : 400;
    res.status(code).json({ status: false, message: error.message });
  }
};
