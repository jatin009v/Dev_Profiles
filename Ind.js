const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const githubToken = core.getInput('github-token');
    const issueMessage = core.getInput('issue-message');
    const prMessage = core.getInput('pr-message');
    const footer = core.getInput('footer') || '';

    // Validate inputs
    if (!githubToken) {
      throw new Error("GitHub token is required but was not provided");
    }
    if (!issueMessage && !prMessage) {
      throw new Error("At least one of 'issue-message' or 'pr-message' must be provided");
    }

    const octokit = github.getOctokit(githubToken);
    const context = github.context;

    if (context.payload.issue) {
      await handleIssueComment(octokit, context, issueMessage, footer);
    } else if (context.payload.pull_request) {
      await handlePRComment(octokit, context, prMessage, footer);
    } else {
      core.info("This event is neither an issue nor a pull request, no comment will be made.");
    }
  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

async function handleIssueComment(octokit, context, issueMessage, footer) {
  const issueComment = `${issueMessage}\n\n${footer}`;
  core.info(`Creating comment on issue #${context.payload.issue.number}`);
  
  await octokit.issues.createComment({
    ...context.repo,
    issue_number: context.payload.issue.number,
    body: issueComment,
  });
}

async function handlePRComment(octokit, context, prMessage, footer) {
  const prComment = `${prMessage}\n\n${footer}`;
  core.info(`Creating comment on pull request #${context.payload.pull_request.number}`);
  
  await octokit.issues.createComment({
    ...context.repo,
    issue_number: context.payload.pull_request.number,
    body: prComment,
  });
}

run();


// Key changes:
// Extract comment logic into functions: Separate the logic for creating issue and PR comments into their own functions to keep run() clean and modular.
// Improve error messages: Provide more context when setting errors.
// Add input validation: Ensure that necessary inputs (github-token, issue-message, pr-message) are provided before running the main logic.
// Add logging: Log helpful information (such as which type of comment is being added) for better traceability when running the action.
// What has been changed:
// Input validation: Checks that the github-token, issue-message, or pr-message are provided. If none are provided, it throws an error before continuing.
// Error handling: Error messages are more descriptive, with specific causes mentioned in core.setFailed(). This provides better feedback when the action fails.
// Modularized comment creation: The logic for creating comments on issues and pull requests has been split into two separate functions (handleIssueComment and handlePRComment). This makes the code easier to maintain and modify in the future.
// Logging: Added core.info() logs to indicate when a comment is being created and on which issue/PR number. This can help trace execution during GitHub Actions runs.
// Description for the PR:
// Refactored code to improve input validation and modularity:

// Added validation to ensure required inputs (github-token, issue-message, and pr-message) are provided.
// Extracted issue and pull request comment logic into their own functions for better modularity and readability.
// Improved error handling with more detailed error messages.
// Added logging to track actions being performed (comment creation on issues/PRs).
// These changes enhance the maintainability and robustness of the action, ensuring smoother contributions to the project.





