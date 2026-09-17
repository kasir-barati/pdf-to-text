# Design & Code Philosophy

- Simpler is better - do not overcomplicate.
- Prefer early returns over nested conditionals.
- Use vitest/pytest.
- Use AAA (Arrange, Act, Assert) style of writing test.
- IMPORTANT: Avoid overly defensive programming; avoid insistence checks; only manage exceptions when necessary.
- Use uv; ALWAYS uv run xxx NEVER python3 xxx.
- Use latest version of libraries and idiomatic approaches as of today.
- Use semantic HTML elements (`main`, `section`, `header`, `nav`, etc.) when one matches the element's role. Reserve `div`/`span` for elements that exist purely for layout or styling with no semantic meaning.

# Testing

- Put each new test in the layer that matches what you actually want to verify.
- If you change/add something make sure to write/update and then run the unit/e2e tests.
- Use jest-extended APIs whever needed.
- Use uut (unit under test) only when you instantiate an object whose methods you will exercise in the test. For example: `uut = MyService(...)` followed by `uut.do_something()`.
- Mocked values should resemble actual domain data (read the code to understand what would the actual domain data would look like): Use realistic data (IDs, hashes, slugs, emails, URLs, etc.):

## Testing Layers

- Unit tests:
  - Question: does this piece of code behave correctly in isolation?
  - Fast, hermetic, no Docker, no network.
  - Test whatever is easy and worthwhile to unit test: pure functions, type validation, error mapping, resolver logic, etc.
  - Mock external dependencies such as database calls, network calls, etc.
  - Add unit tests generously. They are cheap.
