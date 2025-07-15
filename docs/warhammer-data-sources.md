# Warhammer Data Sources and Implementation Guide

## Overview

This document outlines the strategy for gathering comprehensive Warhammer data for the Plastic Crack
application. The approach combines multiple data sources to create a robust, accurate, and
up-to-date product database.

## Data Sources

### 1. Official Sources

#### Games Workshop APIs/Data

- **Warhammer Community API**: Limited but official product data
- **Games Workshop Product Catalog**: Web scraping from their online store
- **Purpose**: Official product names, images, descriptions, and current availability
- **Data Quality**: High accuracy, official source
- **Update Frequency**: As GW releases new products
- **Implementation**: Web scraping with rate limiting and respectful practices

#### Wahapedia

- **Website**: https://wahapedia.ru/
- **Purpose**: Comprehensive rules and unit data
- **Coverage**: All current game systems (40K, AoS, Kill Team, Necromunda, etc.)
- **Data Quality**: Very high, community-maintained but extremely accurate
- **Implementation**: API integration if available, otherwise respectful scraping
- **Data Types**: Unit stats, rules, point costs, abilities

### 2. Community Databases

#### BattleScribe Data Repository

- **GitHub Repository**: https://github.com/BSData/
- **Format**: XML files with structured data
- **Coverage**: Comprehensive unit data, points costs, army compositions
- **Game Systems**: 40K, AoS, Kill Team, Necromunda, Blood Bowl, etc.
- **Data Quality**: High, maintained by dedicated community
- **Update Frequency**: Regular updates with new releases and FAQs
- **Implementation**: Direct XML parsing from GitHub repository

**Key BSData Repositories:**

```
- wh40k (Warhammer 40,000)
- age-of-sigmar (Age of Sigmar)
- kill-team (Kill Team)
- necromunda (Necromunda)
- blood-bowl (Blood Bowl)
- horus-heresy (Horus Heresy)
```

### 3. Retailer APIs and Data

#### Major Warhammer Retailers

- **Element Games**: Product catalog and competitive pricing
- **Dicehead Games**: API available for partners
- **Warhammer Official Store**: Product information and MSRP
- **Amazon/eBay APIs**: Market pricing and availability
- **Purpose**: Real-time pricing, availability, and market data
- **Implementation**: API integration where available, web scraping for others

#### Pricing Data Sources

```
Primary Retailers:
- Games Workshop Official Store (MSRP)
- Element Games (UK)
- Dicehead Games (UK)
- MiniatureMarket (US)
- Amazon (Global)

Secondary Sources:
- eBay (Market prices)
- Local game stores (via manual input)
```

## Implementation Strategy

### Phase 1: Core Data Import (Priority 1)

#### 1.1 BattleScribe Data Integration

```typescript
export class BattleScribeImportService {
  private readonly githubBaseUrl = 'https://raw.githubusercontent.com/BSData';

  async importGameSystem(system: string): Promise<void> {
    // Download catalog XML files
    // Parse unit data, costs, and rules
    // Transform to database schema
    // Handle incremental updates
  }

  async parseUnitData(xmlData: string): Promise<Unit[]> {
    // Extract unit stats, costs, and abilities
    // Map to standardized format
  }
}
```

#### 1.2 Games Workshop Product Catalog

```typescript
export class GWProductImportService {
  async importProductCatalog(): Promise<void> {
    // Scrape GW online store
    // Extract product details, images, descriptions
    // Map to existing unit data from BattleScribe
  }

  async validateProductData(): Promise<void> {
    // Cross-reference with BattleScribe data
    // Flag discrepancies for manual review
  }
}
```

### Phase 2: Pricing Integration (Priority 2)

#### 2.1 Multi-Retailer Pricing Service

```typescript
export class PricingService {
  async updatePricing(): Promise<void> {
    // Aggregate prices from multiple sources
    // Calculate price trends and history
    // Update product availability status
  }

  async trackPriceHistory(): Promise<void> {
    // Store historical pricing data
    // Calculate average prices and trends
    // Alert users to price drops
  }
}
```

### Phase 3: Data Validation and Enhancement (Priority 3)

#### 3.1 Community Contributions

```typescript
export class CommunityDataService {
  async submitProductCorrection(correction: ProductCorrection): Promise<void> {
    // Allow users to submit data corrections
    // Implement moderation workflow
    // Track contributor reputation
  }

  async validateCommunityData(): Promise<void> {
    // Cross-reference user submissions
    // Auto-approve high-confidence changes
  }
}
```

## Database Schema Considerations

### Core Product Model

```typescript
model Product {
  id              String            @id @default(cuid())
  name            String
  gameSystem      GameSystem
  faction         String?
  subfaction      String?
  productType     ProductType       // Unit, Vehicle, Character, etc.
  pointsCost      Int?
  powerLevel      Int?              // For 40K
  retailPrice     Decimal?
  description     String?
  imageUrl        String?
  officialUrl     String?           // Link to GW store page

  // BattleScribe Integration
  battlescribeId  String?           @unique
  lastBSUpdate    DateTime?

  // Pricing Data
  priceHistory    PriceHistory[]
  availability    ProductAvailability[]

  // Community Data
  userCorrections ProductCorrection[]

  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
}

model PriceHistory {
  id          String    @id @default(cuid())
  productId   String
  product     Product   @relation(fields: [productId], references: [id])
  retailer    String
  price       Decimal
  currency    String    @default("GBP")
  inStock     Boolean   @default(true)
  recordedAt  DateTime  @default(now())
}

model ProductAvailability {
  id          String    @id @default(cuid())
  productId   String
  product     Product   @relation(fields: [productId], references: [id])
  retailer    String
  inStock     Boolean
  stockLevel  String?   // "High", "Low", "Last Few", etc.
  lastChecked DateTime  @default(now())
}

enum GameSystem {
  WARHAMMER_40K
  AGE_OF_SIGMAR
  KILL_TEAM
  NECROMUNDA
  BLOOD_BOWL
  HORUS_HERESY
  MIDDLE_EARTH
}

enum ProductType {
  INFANTRY
  VEHICLE
  MONSTER
  CHARACTER
  TERRAIN
  RULEBOOK
  ACCESSORY
}
```

## Data Update Schedule

### Automated Updates

- **BattleScribe Data**: Daily check for repository updates
- **Pricing Data**: Every 6 hours for major retailers
- **Availability**: Every 12 hours
- **GW Product Catalog**: Weekly full scan

### Manual Processes

- **New Product Validation**: Weekly review of new additions
- **Community Corrections**: Daily moderation
- **Data Quality Audits**: Monthly comprehensive review

## Implementation Services

### 1. Data Import Service

```typescript
export class WarhammerDataImportService {
  constructor(
    private battlescribeService: BattleScribeImportService,
    private gwService: GWProductImportService,
    private pricingService: PricingService
  ) {}

  async performFullImport(): Promise<void> {
    // Orchestrate complete data import
    // Handle dependencies between services
    // Log progress and errors
  }

  async performIncrementalUpdate(): Promise<void> {
    // Update only changed data
    // Optimize for minimal API calls
  }
}
```

### 2. Data Validation Service

```typescript
export class DataValidationService {
  async validateProductConsistency(): Promise<ValidationReport> {
    // Check for duplicates
    // Validate price reasonableness
    // Ensure data completeness
  }

  async crossReferenceData(): Promise<void> {
    // Match BattleScribe data with GW catalog
    // Identify missing products
    // Flag potential errors
  }
}
```

## Rate Limiting and Ethical Considerations

### Scraping Guidelines

- **Respect robots.txt** files
- **Implement delays** between requests (minimum 1 second)
- **Use User-Agent** headers identifying the application
- **Monitor response codes** and back off on errors
- **Cache data** to minimize repeated requests

### API Usage

- **Respect rate limits** imposed by data providers
- **Implement exponential backoff** for failed requests
- **Store API keys securely** in environment variables
- **Monitor usage quotas** and costs

## Monitoring and Maintenance

### Data Quality Metrics

- **Completeness**: Percentage of products with full data
- **Accuracy**: User-reported error rates
- **Freshness**: Age of last update per data source
- **Coverage**: Percentage of GW catalog represented

### Error Handling

```typescript
export class DataImportErrorHandler {
  async handleImportError(error: ImportError): Promise<void> {
    // Log detailed error information
    // Notify administrators of critical failures
    // Implement retry logic with backoff
    // Maintain data integrity during failures
  }
}
```

## Future Enhancements

### Machine Learning Integration

- **Price prediction** based on historical data
- **Product recommendation** based on user collections
- **Automated data validation** using ML models
- **Image recognition** for product identification

### Advanced Features

- **Real-time price alerts** for users
- **Stock availability notifications**
- **Price comparison tools**
- **Historical price charts and analysis**

## Security Considerations

### Data Protection

- **Sanitize all imported data** to prevent injection attacks
- **Validate data types and ranges** before database insertion
- **Encrypt sensitive configuration** (API keys, credentials)
- **Implement audit logging** for all data changes

### Access Control

- **Separate read/write permissions** for different services
- **Use service accounts** with minimal required permissions
- **Regularly rotate API keys** and credentials
- **Monitor for unusual access patterns**

---

## Quick Start Implementation

For immediate implementation, prioritize:

1. **BattleScribe XML parsing** for core unit data
2. **GW store scraping** for product names and images
3. **Basic pricing from 2-3 major retailers**
4. **Simple data validation and deduplication**

This foundational approach will provide comprehensive product data while establishing the
infrastructure for more advanced features.
