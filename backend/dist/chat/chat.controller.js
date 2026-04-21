"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = exports.ChatParameterRequestDto = exports.ChatImageRequestDto = exports.ChatRequestDto = void 0;
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
class ChatRequestDto {
}
exports.ChatRequestDto = ChatRequestDto;
class ChatImageRequestDto {
}
exports.ChatImageRequestDto = ChatImageRequestDto;
class ChatParameterRequestDto {
}
exports.ChatParameterRequestDto = ChatParameterRequestDto;
let ChatController = class ChatController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    async processQuery(request) {
        console.log('Chat controller received request:', { query: request.query, machineId: request.machineId });
        const response = await this.chatService.processQuery(request.query, request.machineId);
        return {
            response,
            timestamp: new Date().toISOString(),
        };
    }
    async diagnoseImage(request) {
        console.log('Chat image diagnosis request received:', { machineId: request.machineId, hasImage: !!request.imageDataUrl });
        const response = await this.chatService.diagnoseImage(request.imageDataUrl, request.machineId, request.note);
        return {
            response,
            timestamp: new Date().toISOString(),
        };
    }
    async diagnoseParameters(request) {
        console.log('Chat parameter diagnosis request received:', { machineId: request.machineId, machineType: request.machineType });
        const response = await this.chatService.diagnoseParameters(request);
        return {
            response,
            timestamp: new Date().toISOString(),
        };
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Post)('query'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ChatRequestDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "processQuery", null);
__decorate([
    (0, common_1.Post)('diagnose-image'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ChatImageRequestDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "diagnoseImage", null);
__decorate([
    (0, common_1.Post)('diagnose-parameters'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ChatParameterRequestDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "diagnoseParameters", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map