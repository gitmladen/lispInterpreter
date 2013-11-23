var request = require('superagent');
var expect = require('expect.js');
var assert = require('assert');

var interpreter = require('./disi.js');



describe('Array', function () {
  describe('#indexOf()', function () {
    var e = interpreter.eval;

    it('summ', function () {
      assert.equal(
        e('(+ 2 2)'),
        4
      );
    });
    it('summ', function () {
      assert.equal(
        e('(- 10 1)'),
        9
      );
    });

    it('multi sum', function () {
      assert.equal(
        e('(+ 2 2 2 2 -3)'),
        5
      );
    });

    it('multi sum ', function () {
      assert.equal(
        e('(+ (* 2 100) (* 1 10))'),
        210
      );
    });

    it('multi sum mul', function () {
      assert.equal(
        e('(+ (* 2 100) (* 1 10))'),
        210
      );
    });

    it('defun single param', function () {
      var res = e('(defun testna (x) (+ x 2)) (testna 4)');
      assert.equal(res[0], 'testna');
      assert.equal(res[1], 6);
    });

    it('defun multy param', function () {
      var res = e('(defun testna (x y z g) (+ x y z g)) (testna 4 13 1 2)');
      assert.equal(res[0], 'testna');
      assert.equal(res[1], 20);
    });

    it('greater-tnan', function () {
      assert.equal(
        e('(> 1 2)')[0],
        false
      );
    });
    it('less-than', function () {
      assert.equal(
        e('(< 1 2)')[0],
        true
      );
    });
    it('if-true', function () {
      assert.equal(
        e('(if (> 2 1) (+ 10 15) (+ 2 3) )'),
        25
      );
    });
    it('if-false', function () {
      assert.equal(
        e('(if (< 2 1) (+ 10 15) (+ 2 3) )'),
        5
      );
    });
    it('recursion-factorial', function () {
      var res = e('(defun fact (x) (if (> x 1) (* (fact (- x 1)) x ) (+ 0 1))) (fact 12)');
      assert.equal(
        res[1],
        479001600
      );
    });
    it('recursion-fibonacci', function () {
      var res = e('(defun fib (n) (if (< n 2) n (+ (fib (- n 1)) (fib (- n 2)))))  (fib 14)');
      assert.equal(
        res[1],
        377
      );
    });
    it('quote-1', function () {
      assert.deepEqual(e('(quote (2 3 5))'), [
        ['2', '3', '5']
      ]);
    });
    it('car', function () {
      assert.equal(
        e('(car (quote (2 (+ 4 5) 5)))'),
        '2'
      );
    });
    it('cdr', function () {
      assert.deepEqual(e('(cdr (quote (2 4 5)))'), [
        ['4', '5']
      ]);
    });
    it('list', function () {
      assert.deepEqual(
        e('(list 2 (+ 4 5) 5)')[0], [2, 9, 5]
      );
    });
    it('list cdr', function () {
      assert.deepEqual(
        e('(cdr (list 2 (+ 4 5) 5))')[0], [9, 5]
      );
    });
    it('primitive-let-multi-variables-multi-body', function () {
      assert.equal(
        e('(let ((a 1)(b 2)(c 3)) (+ a b) (+ a b c) )'),
        6
      );
    });
    it('let-multi-complex-variables', function () {
      assert.equal(
        e('(let ((a (+ (* 1 2) 4 (+ 1 2))) (b (+ 2 (+ 3 1)))) (+ a b) )'),
        15
      );
    });
    it('let-&-defun-let-formal-parameters-clash', function () {
      assert.equal(
        e('( let ((x 1)) (defun f (x) (+ x 1) ) ) (f 43)')[1],
        44
      );
    });
    it('let-fun-definition-scope', function () {
      assert.equal(
        e('(let ((a 5)) (+ a (+ 1 (+ 1 a))) )'),
        12
      );
    });
    it('let-nested-covering', function () {
      assert.equal(
        e('(let ((a 5)) (let ((a 2))  (+ 0 2) ) )'),
        2
      );
    });
    it('let-nested-covering-mixed', function () {
      assert.equal(
        e('(let ((a 5)) (+ (let ((a 2))  (+ 0 2) ) a) )'),
        7
      );
    });
    it('let-fun-definition-scope', function () {
      assert.equal(
        e('( let ((y 5)) (defun f (x) (+ x 1 y) ) ) (f 43)')[1],
        49
      );
    });


    it('setq-basic', function () {
      assert.equal(
        e('(setq x 1 y 2)  (+ x y )')[1],
        3
      );
    });


    it('lambda-basic', function () {
      assert.equal(
        e('( (lambda (x) (+ x 1)) 4 )'),
        5
      );
    });


  })
})



// TEST("(quote (testing 1 (2.0) -3.14e159))", "(testing 1 (2.0) -3.14e159)");
//     TEST("(+ 2 2)", "4");
//     TEST("(+ (* 2 100) (* 1 10))", "210");
//     TEST("(if (> 6 5) (+ 1 1) (+ 2 2))", "2");
//     TEST("(if (< 6 5) (+ 1 1) (+ 2 2))", "4");
//     TEST("(define x 3)", "3");
//     TEST("x", "3");
//     TEST("(+ x x)", "6");
//     TEST("(begin (define x 1) (set! x (+ x 1)) (+ x 1))", "3");
//     TEST("((lambda (x) (+ x x)) 5)", "10");
//     TEST("(define twice (lambda (x) (* 2 x)))", "<Lambda>");
//     TEST("(twice 5)", "10");
//     TEST("(define compose (lambda (f g) (lambda (x) (f (g x)))))", "<Lambda>");
//     TEST("((compose list twice) 5)", "(10)");
//     TEST("(define repeat (lambda (f) (compose f f)))", "<Lambda>");
//     TEST("((repeat twice) 5)", "20");
//     TEST("((repeat (repeat twice)) 5)", "80");
//     TEST("(define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1))))))", "<Lambda>");
//     TEST("(fact 3)", "6");
//     //TEST("(fact 50)", "30414093201713378043612608166064768844377641568960512000000000000");
//     TEST("(fact 12)", "479001600"); // no bignums; this is as far as we go with 32 bits
//     TEST("(define abs (lambda (n) ((if (> n 0) + -) 0 n)))", "<Lambda>");
//     TEST("(list (abs -3) (abs 0) (abs 3))", "(3 0 3)");
//     TEST("(define combine (lambda (f)"
//              "(lambda (x y)"
//                 "(if (null? x) (quote ())"
//                 "(f (list (car x) (car y))"
//                 "((combine f) (cdr x) (cdr y)))))))", "<Lambda>");
//     TEST("(define zip (combine cons))", "<Lambda>");
//     TEST("(zip (list 1 2 3 4) (list 5 6 7 8))", "((1 5) (2 6) (3 7) (4 8))");
//     TEST("(define riff-shuffle (lambda (deck) (begin"
//             "(define take (lambda (n seq) (if (<= n 0) (quote ()) (cons (car seq) (take (- n 1) (cdr seq))))))"
//             "(define drop (lambda (n seq) (if (<= n 0) seq (drop (- n 1) (cdr seq)))))"
//             "(define mid (lambda (seq) (/ (length seq) 2)))"
//             "((combine append) (take (mid deck) deck) (drop (mid deck) deck)))))", "<Lambda>");
//     TEST("(riff-shuffle (list 1 2 3 4 5 6 7 8))", "(1 5 2 6 3 7 4 8)");
//     TEST("((repeat riff-shuffle) (list 1 2 3 4 5 6 7 8))",  "(1 3 5 7 2 4 6 8)");
//     TEST("(riff-shuffle (riff-shuffle (riff-shuffle (list 1 2 3 4 5 6 7 8))))", "(1 2 3 4 5 6 7 8)");