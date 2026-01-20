# Cronos AI Agent SDK - Retrofit Prompt

## Objective
Transform the existing vault-specific agent application into a generic, reusable SDK that developers can install and use for any Cronos EVM protocol (DeFi, NFT, payments, etc.).

## Current State Analysis
You have a working agent system with:
- ✅ 4 functional agents (vault-specific)
- ✅ Agent registry and type system
- ✅ Event listener architecture
- ✅ AI integration with fallback logic
- ✅ Policy enforcement (clamping)
- ✅ Express API server
- ✅ Smart contract integration

## Target SDK Architecture

### 1. Package Structure
```
/packages/
  /core/                    # Main SDK package
    /src/
      /agents/              # Generic agent framework
      /contracts/           # Contract abstraction layer
      /events/              # Event listener system
      /policies/            # Safety & governance
      /ai/                  # AI provider integrations
  /cronos-client/           # Cronos-specific utilities
  /examples/
    /vault-demo/            # Current app becomes example
    /dex-demo/              # DEX agent example
    /lending-demo/          # Lending protocol example
```

### 2. Core SDK Interface
```typescript
// Target developer experience
import { CronosAgentSDK } from '@cronos/ai-agent-sdk';

const sdk = new CronosAgentSDK({
  network: 'cronos-testnet',
  privateKey: process.env.AGENT_PRIVATE_KEY,
  aiProvider: 'openai',
  aiApiKey: process.env.OPENAI_API_KEY
});

// Register any contract
await sdk.registerContract('my-vault', vaultABI, vaultAddress);
await sdk.registerContract('my-dex', dexABI, dexAddress);

// Use built-in agents
const result = await sdk.executeAgent('liquidity-optimizer', {
  contract: 'my-vault',
  user: '0x123...',
  customParams: { targetRatio: 0.6 }
});

// Register custom agents
sdk.registerAgent('my-custom-agent', new MyCustomAgent());
```

## Retrofit Tasks

### Phase 1: Extract Core Framework (Priority 1)

#### Task 1.1: Create Generic Agent Interface
- **Extract** `/agents/types.ts` → `/packages/core/src/agents/types.ts`
- **Generalize** `AgentContext` to work with any contract type
- **Create** `BaseAgent<TContext, TAction>` abstract class
- **Remove** vault-specific fields from core types

#### Task 1.2: Abstract Contract Layer
- **Create** `/packages/core/src/contracts/ContractInterface.ts`
- **Abstract** contract interactions (replace direct vault calls)
- **Create** contract registry system
- **Support** multiple ABIs and addresses

#### Task 1.3: Generalize Event System
- **Extract** `/listeners/vaultEvents.js` → `/packages/core/src/events/EventListener.ts`
- **Make** event listener work with any contract
- **Create** event subscription system
- **Support** multiple contract event monitoring

#### Task 1.4: Extract Policy Layer
- **Move** `/agents/clamp.js` → `/packages/core/src/policies/PolicyEngine.ts`
- **Generalize** clamping logic for any action type
- **Create** pluggable policy system
- **Support** custom validation rules

### Phase 2: Create SDK Entry Point (Priority 2)

#### Task 2.1: Main SDK Class
- **Create** `/packages/core/src/CronosAgentSDK.ts`
- **Implement** contract registration
- **Implement** agent registration and execution
- **Implement** event listener management
- **Add** configuration management

#### Task 2.2: Agent Registry Refactor
- **Refactor** `/agents/registry.js` → `/packages/core/src/agents/AgentRegistry.ts`
- **Support** dynamic agent registration
- **Remove** hardcoded agent list
- **Add** agent validation and lifecycle management

#### Task 2.3: AI Provider Abstraction
- **Extract** OpenAI logic → `/packages/core/src/ai/AIProvider.ts`
- **Create** provider interface for multiple AI services
- **Support** provider switching and fallback
- **Maintain** existing AI integration patterns

### Phase 3: Move Current App to Example (Priority 3)

#### Task 3.1: Vault Demo Migration
- **Move** current `/agent-service/` → `/packages/examples/vault-demo/`
- **Refactor** to use new SDK instead of direct imports
- **Maintain** same API endpoints and behavior
- **Use** as SDK validation and reference implementation
- **Update** documentation to show SDK usage patterns

#### Task 3.2: Create Additional Examples
- **Create** `/packages/examples/dex-demo/` - DEX liquidity management
- **Create** `/packages/examples/lending-demo/` - Lending protocol automation
- **Show** SDK versatility across different protocols

### Phase 4: Package & Distribution (Priority 4)

#### Task 4.1: NPM Package Setup
- **Create** `package.json` for each package
- **Set up** TypeScript build system
- **Configure** exports and dependencies
- **Add** proper versioning

#### Task 4.2: Documentation
- **Create** SDK installation guide
- **Write** API reference documentation
- **Add** integration examples
- **Document** custom agent development

## Key Principles

### 1. Functional Compatibility
- Vault demo must maintain same API behavior when refactored to use SDK
- Existing API endpoints should remain functional
- Same agent decisions and response formats
- Migration path should be clear and documented

### 2. Protocol Agnostic
- No hardcoded contract types or ABIs
- Generic context and action types
- Pluggable contract adapters

### 3. Developer Experience
- Simple installation (`npm install @cronos/ai-agent-sdk`)
- Minimal configuration required
- Clear examples and documentation
- TypeScript support with proper types

### 4. Safety First
- Policy enforcement remains mandatory
- Agent permissions and limits
- Audit trail and logging
- Fail-safe defaults

## Success Criteria

### Technical
- [ ] SDK can be installed via NPM
- [ ] Works with vault contracts (existing functionality)
- [ ] Works with at least one other protocol type (DEX/lending)
- [ ] Custom agents can be registered and executed
- [ ] Event-driven automation works generically
- [ ] AI integration works across different agent types

### Developer Experience
- [ ] 5-minute setup for basic usage
- [ ] Clear documentation with examples
- [ ] TypeScript intellisense works properly
- [ ] Error messages are helpful and actionable

### Compatibility
- [ ] Vault demo maintains same API behavior (refactored to use SDK)
- [ ] All existing agents function properly through SDK
- [ ] API responses maintain same format
- [ ] Performance is equivalent or better
- [ ] Vault demo serves as SDK usage example

## Implementation Notes

### Start With
1. Copy current project to new folder
2. Create `/packages/` structure
3. Begin with Task 1.1 (Generic Agent Interface)
4. Test each phase before moving to next

### Avoid
- Breaking existing API functionality during refactor
- Over-engineering the abstraction layer
- Losing the working AI integration
- Making the SDK too complex for simple use cases
- Maintaining duplicate code (vault demo should use SDK)

### Focus On
- Maintaining the proven agent patterns
- Keeping the safety/policy system intact
- Preserving the AI fallback logic
- Creating clear separation between core and examples
- Making vault demo the first successful SDK customer

This retrofit will transform your working prototype into a production-ready SDK that other developers can use to build AI-powered automation for any Cronos protocol.