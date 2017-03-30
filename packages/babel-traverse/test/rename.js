const traverse = require("../lib").default;
const assert = require("assert");
const parse = require("babylon").parse;

function getPath(code) {
  const ast = parse(code);
  let path;
  traverse(ast, {
    Program: function (_path) {
      path = _path;
      _path.stop();
    },
  });
  return path;
}

describe("binding rename", function() {
  it("variable declaration", function () {
    const path = getPath("var a; a");
    path.scope.rename("a", "b");

    assert(path.scope.getBinding("a") === undefined);
    assert.ok(path.scope.getBinding("b"));
  });

  it("variable with switch descriminant", function () {
    const path = getPath("var a; switch(a){}");
    path.scope.rename("a", "b");

    assert(path.scope.getBinding("a") === undefined);
    assert.ok(path.scope.getBinding("b"));
  });

  it("switchCase rename discriminant", function () {
    const path = getPath("let a; switch (a) { case 0: let a; }");
    // get SwitchCase
    const sc = path.get("body")[1].get("cases")[0];
    // get SwitchStatement discriminant
    const scd = path.get("body")[1].get("discriminant");
    assert(scd.node.name === "a");

    sc.scope.rename("a");
    assert(scd.node.name === "a");

    scd.scope.rename("a", "b");
    assert(scd.node.name === "b");
  });
});
