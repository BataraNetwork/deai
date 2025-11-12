"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidatorRegistry = void 0;
const events_1 = require("events");
class ValidatorRegistry extends events_1.EventEmitter {
    constructor(initialValidators) {
        super();
        this.validators = new Map();
        this.balances = new Map();
        initialValidators.forEach(v => this.validators.set(v.publicKey, v));
    }
    addValidator(validator) {
        this.validators.set(validator.publicKey, validator);
        this.emit('update', this.getValidators());
    }
    removeValidator(publicKey) {
        this.validators.delete(publicKey);
        this.emit('update', this.getValidators());
    }
    getValidators() {
        return Array.from(this.validators.values());
    }
    updateStake(publicKey, amount) {
        const validator = this.validators.get(publicKey);
        if (validator) {
            validator.stake += amount;
            this.emit('update', this.getValidators());
            return true;
        }
        else {
            return false;
        }
    }
    getBalance(address) {
        return this.balances.get(address) || 0;
    }
    updateBalance(address, amount) {
        const currentBalance = this.balances.get(address) || 0;
        this.balances.set(address, currentBalance + amount);
    }
}
exports.ValidatorRegistry = ValidatorRegistry;
