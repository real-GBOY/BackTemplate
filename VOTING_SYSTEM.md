<!-- @format -->

# Voting System Implementation

## Overview

The voting system has been fully implemented with comprehensive election management, vote casting, and results aggregation. The system supports both President and Board elections with different voting rules.

## Features Implemented

### 1. Election Management

- **Election Model**: Tracks election cycles with start/end dates and status
- **Election Types**: President and Board elections
- **Election Status**: Draft, Active, Closed
- **Admin Controls**: Create, update, start, close, and delete elections

### 2. Voting System

- **Vote Casting**: Authenticated and verified users only
- **Vote Rules**:
  - President: One vote per member total
  - Board: One yes/no vote per member per candidate
- **Duplicate Prevention**: Database constraints prevent duplicate voting
- **Active Election Validation**: Only active elections accept votes

### 3. Results & Analytics

- **Real-time Results**: Aggregated vote counts and percentages
- **President Results**: Total votes per candidate with percentages
- **Board Results**: Yes/No breakdown per candidate with percentages
- **Public Access**: Results are publicly accessible

## API Endpoints

### Election Management (`/api/elections/`)

#### Public Routes

- `GET /` - Get all elections (with optional filters)
- `GET /active` - Get currently active elections
- `GET /:id` - Get election by ID

#### Admin Routes

- `POST /` - Create new election
- `PATCH /:id` - Update election
- `DELETE /:id` - Delete election (draft only)
- `PATCH /:id/start` - Start election
- `PATCH /:id/close` - Close election

### Voting (`/api/votes/`)

#### Authenticated Routes

- `POST /` - Cast a vote (verified users only)
- `GET /my-votes` - Get user's own votes

#### Public Routes

- `GET /results/:electionType` - Get election results
- `GET /results/president` - Get president election results
- `GET /results/board` - Get board election results

#### Admin Routes

- `GET /` - Get all votes (with optional filters)

## Database Models

### Election Model

```javascript
{
  electionType: "president" | "board",
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  status: "draft" | "active" | "closed",
  createdBy: ObjectId (User)
}
```

### Vote Model (Enhanced)

```javascript
{
  electionType: "president" | "board",
  memberId: ObjectId (User),
  candidateId: ObjectId (Candidate),
  boardChoice: "yes" | "no" (for board elections only)
}
```

## Voting Rules

### President Elections

- Each member can vote for **one candidate only**
- Vote is cast by providing `candidateId`
- No `boardChoice` required

### Board Elections

- Each member can vote **yes or no** for **each candidate**
- Vote requires both `candidateId` and `boardChoice`
- Members can vote on multiple board candidates

## Security Features

### Authentication & Authorization

- **JWT Authentication**: All voting requires valid access token
- **User Verification**: Only verified users can vote
- **Role-based Access**: Admin-only election management
- **Token Refresh**: Secure token renewal system

### Vote Integrity

- **Duplicate Prevention**: Database unique constraints
- **Active Election Validation**: Only active elections accept votes
- **Candidate Validation**: Votes only accepted for active candidates
- **Date Validation**: Elections must have valid start/end dates

## Usage Examples

### 1. Create and Start Election (Admin)

```bash
# Create election
POST /api/elections
{
  "electionType": "president",
  "title": "2024 President Election",
  "startDate": "2024-01-15T00:00:00.000Z",
  "endDate": "2024-01-20T23:59:59.000Z"
}

# Start election
PATCH /api/elections/{electionId}/start
```

### 2. Cast Vote (Member)

```bash
# President vote
POST /api/votes
{
  "electionType": "president",
  "candidateId": "candidateId123"
}

# Board vote
POST /api/votes
{
  "electionType": "board",
  "candidateId": "candidateId456",
  "boardChoice": "yes"
}
```

### 3. Get Results

```bash
# President results
GET /api/votes/results/president

# Board results
GET /api/votes/results/board
```

## Results Format

### President Results

```json
{
	"electionType": "president",
	"election": {
		"title": "2024 President Election",
		"status": "active",
		"startDate": "2024-01-15T00:00:00.000Z",
		"endDate": "2024-01-20T23:59:59.000Z"
	},
	"totalVotes": 150,
	"results": [
		{
			"_id": "candidateId123",
			"candidateName": "John Doe",
			"totalVotes": 85,
			"percentage": "56.67"
		}
	]
}
```

### Board Results

```json
{
	"electionType": "board",
	"totalVotes": 300,
	"results": [
		{
			"candidateId": "candidateId456",
			"candidateName": "Jane Smith",
			"totalVotes": 100,
			"yesVotes": 75,
			"noVotes": 25,
			"yesPercentage": 75.0,
			"noPercentage": 25.0
		}
	]
}
```

## Testing

### HTTP Test Files

- `http/vote.http` - Vote casting and results testing
- `http/election.http` - Election management testing
- `http/voting_workflow.http` - Complete workflow testing

### Test Scenarios

1. **Complete Workflow**: Create election → Start → Vote → Get results → Close
2. **Error Handling**: Invalid votes, duplicate voting, unauthorized access
3. **Edge Cases**: Closed elections, inactive candidates, unverified users

## Environment Variables

Ensure these are set in your `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/your_database
PORT=6969
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

## Next Steps

The voting system is now fully functional and ready for production use. Consider these enhancements:

1. **Email Notifications**: Notify users of election start/end
2. **Audit Logging**: Track all voting activities
3. **Advanced Analytics**: Historical data and trends
4. **Election Templates**: Pre-configured election types
5. **Vote Verification**: Additional verification methods
6. **Real-time Updates**: WebSocket for live results

## Security Considerations

- All JWT tokens are environment-based (no hardcoded secrets)
- Vote integrity is enforced at the database level
- User verification prevents unauthorized voting
- Election status controls when voting is allowed
- Comprehensive error handling prevents information leakage
