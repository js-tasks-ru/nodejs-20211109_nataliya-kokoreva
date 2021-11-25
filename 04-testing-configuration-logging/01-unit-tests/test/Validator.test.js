const Validator = require('../Validator');
const expect = require('chai').expect;

describe('testing-configuration-logging/unit-tests', () => {
  describe('Validator', () => {
    it('валидатор проверяет строковые поля', () => {
      const validator = new Validator({
        name: {
          type: 'string',
          min: 10,
          max: 20,
        },
      });

      const errors = validator.validate({name: 'Lalala'});

      expect(errors).to.have.length(1);
      expect(errors[0]).to.have.property('field').and.to.be.equal('name');
      expect(errors[0]).to.have.property('error').and.to.be.equal('too short, expect 10, got 6');
    });

    it('валидатор проверяет крайнее макcимальное значение строкового поля', () => {
      const validator = new Validator({
        name: {
          type: 'string',
          min: 10,
          max: 20,
        },
      });

      const errors = validator.validate({name: 'LalalalalaLalalalala'});

      expect(errors).to.have.length(0);
    });

    it('валидатор проверяет корректность сравнения типов', () => {
      const validator = new Validator({
        name: {
          type: 'string',
          min: 10,
          max: 20,
        },
      });

      const errors = validator.validate({name: false});

      expect(errors).to.have.length(1);
      expect(errors[0]).to.have.property('field').and.to.be.equal('name');
      expect(errors[0]).to.have.property('error').and.to.be.equal('expect string, got boolean');
    });

    it('валидатор проверяет корректность проверки NaN', () => { // вот тут косяк в исходном коде
      const validator = new Validator({
        age: {
          type: 'number',
          min: 0,
          max: 100,
        },
      });

      const errors = validator.validate({age: NaN});

      expect(errors).to.have.length(1);
      expect(errors[0]).to.have.property('field').and.to.be.equal('age');
      expect(errors[0]).to.have.property('error').and.to.be.equal('expect actual number instead of NaN');
    });

    it('валидатор проверяет на null', () => {
      const validator = new Validator({
        age: {
          type: 'number',
          min: 0,
          max: 100,
        },
      });

      const errors = validator.validate({age: null});

      expect(errors).to.have.length(1);
      expect(errors[0]).to.have.property('field').and.to.be.equal('age');
      expect(errors[0]).to.have.property('error').and.to.be.equal('expect number, got object');
    });

    it('валидатор проверяет на undefined', () => {
      const validator = new Validator({
        name: {
          type: 'string',
          min: 10,
          max: 100,
        },
      });

      const errors = validator.validate({name: undefined});

      expect(errors).to.have.length(1);
      expect(errors[0]).to.have.property('field').and.to.be.equal('name');
      expect(errors[0]).to.have.property('error').and.to.be.equal('expect string, got undefined');
    });

    it('валидатор проверяет на пустую строку', () => {
      const validator = new Validator({
        name: {
          type: 'string',
          min: 0,
          max: 100,
        },
      });

      const errors = validator.validate({name: ''});

      expect(errors).to.have.length(0);
    });

    it('валидатор проверяет на преобразование пустой строки', () => {
      const validator = new Validator({
        age: {
          type: 'number',
          min: 0,
          max: 100,
        },
      });

      const errors = validator.validate({age: '' + 10});

      expect(errors).to.have.length(1);
      expect(errors[0]).to.have.property('field').and.to.be.equal('age');
      expect(errors[0]).to.have.property('error').and.to.be.equal('expect number, got string');
    });

    it('валидатор проверяет завершение проверки после первой ошибки', () => {
      const validator = new Validator({
        name: {
          type: 'string',
          min: 15,
          max: 100,
        },
        age: {
          type: 'number',
          min: 0,
          max: 100,
        },
      });

      const errors = validator.validate({name: 'La', age: 5});

      expect(errors).to.have.length(1);
      expect(errors[0]).to.have.property('field').and.to.be.equal('name');
      expect(errors[0]).to.have.property('error').and.to.be.equal( `too short, expect 15, got 2`);
    });

    it('валидатор проверяет завершение проверки после первой ошибки', () => {
      const validator = new Validator({
        name: {
          type: 'string',
          min: 2,
          max: 100,
        },
        age: {
          type: 'number',
          min: 0,
          max: 100,
        },
      });

      const errors = validator.validate({name: 'La', age: -5});

      expect(errors).to.have.length(1);
      expect(errors[0]).to.have.property('field').and.to.be.equal('age');
      expect(errors[0]).to.have.property('error').and.to.be.equal( `too little, expect 0, got -5`);
    });
  });
});
