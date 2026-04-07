const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String, required: true },
    actorId: { type: String, default: null },
    actorName: { type: String, required: true },
    actorRole: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: String, required: true, index: true },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

module.exports = mongoose.model('Audit', auditSchema);
