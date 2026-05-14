export default class MongoDao {
  constructor(model) {
    this.model = model;
  }

  // ✅ Ahora acepta options sin romper lo anterior
  getAll = async (options = {}) => {
    const {
      filter = {},
      sort = {},
      limit = 0,   // 0 = sin límite
      page = 1,
      lean = true,
    } = options;

    // Si tu model tiene paginate (lo tiene), usamos paginate para futuro
    if (typeof this.model.paginate === "function") {
      const paginated = await this.model.paginate(filter, {
        page,
        limit: limit || 50, // si no mandás limit, por defecto 50
        sort,
        lean,
      });

      // devolvemos un objeto consistente
      return {
        docs: paginated.docs,
        totalDocs: paginated.totalDocs,
        totalPages: paginated.totalPages,
        page: paginated.page,
        hasNextPage: paginated.hasNextPage,
        hasPrevPage: paginated.hasPrevPage,
      };
    }

    // fallback si no existe paginate
    let q = this.model.find(filter).sort(sort);
    if (limit > 0) q = q.limit(limit);
    if (lean) q = q.lean();
    const docs = await q;
    return { docs };
  };

  getById = async (id) => this.model.findById(id);

  create = async (body) => this.model.create(body);

  update = async (id, body) =>
    this.model.findByIdAndUpdate(id, body, { new: true });

  delete = async (id) => this.model.findByIdAndDelete(id);

  /* 🔥 HOME */
  getFeatured = async () => {
    return await this.model.find({ featured: true }).lean();
  };

  getPopular = async () => {
    return await this.model
      .find()
      .sort({
        "stats.purchases": -1,
        "stats.cart": -1,
        "stats.views": -1,
      })
      .limit(20)
      .lean();
  };

  incrementView = async (id) => {
    await this.model.findByIdAndUpdate(id, {
      $inc: { "stats.views": 1 },
    });
  };
}

