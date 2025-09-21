// models/course.model.js
module.exports = (sequelize, DataTypes) => {
	const Course = sequelize.define('Course', {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false
		},
		studentId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'Students',
				key: 'id',
			}
		},
		courseName: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		subjects: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		grade: {
			type: DataTypes.STRING(5),
		},
		percentage: {
			type: DataTypes.STRING(5),
		},
		courseDuration: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		createdAt: {
			allowNull: false,
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW 
		},
		updatedAt: {
			allowNull: false,
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW
		}
	}, {
		tableName: 'course'
	});

	Course.associate = (models) => {
		Course.belongsTo(models.Student, { foreignKey: 'id' });
	}

	return Course;
};
