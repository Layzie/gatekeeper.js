buster.testCase 'GatekeeperTest',
  setUp: ->
  'Gatekeeper should be initialized when call script': ->
    text = 'hello'
    assert.equals 'hello', text
