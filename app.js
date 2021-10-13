"use strict";
exports.__esModule = true;
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
var user = prisma.user.create({
    data: {
        name: "Vuong"
    }
}).then(function (result) {
    console.log(result);
});
