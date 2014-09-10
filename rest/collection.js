var Collection = {
	handlers : {},
	register : function(path, properties)
	{
		this.handlers[path] = properties;
	}
};

module.exports = Collection;