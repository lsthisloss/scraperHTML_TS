## A TypeScript-based web scraping project for downloading and processing catalog data. In ES style, follows SOLID principles    

## Features
- Use TypeScript.    
- Follows SOLID principles.
- Fetches catalogs data from a website.      
- Serialize catalog's information in a data.json file.    
- Save PDF files for each catalog, check for an unique name.    

## Classess
`BaseScraper` base class which implements `IScraper` interface and `generic` type of content.      
`CatalogScraper` implements the `ICatalogScraper`  and extends the `BaseScraper` class, inheriting shared functionality.            
`ServiceProvider` encapsulating logic associated with files or directories processing: reading, writing, downloading. It provides a set of methods for working with catalogs.        

## Services
`ServiceProvider` provides an access to the services `FileDownloader`, `FileManager`, `HttpClient`, `HttpParser`, `Serializer`.       

## Catalogs interface
```js
interface ICatalog {
    name: string;
    link: string;
    validity: string;
    filename?: string;
    lastParsed: Date;
}
```

## The project structure        
The structure is displayed in a tree format for clarity.
<details>
<summary>Click to expand the project structure</summary>    

```plaintext
├── engine/
│   ├── classes/                # Core classes implementing business logic
│   │   ├── BaseScraper.ts
│   │   ├── CatalogScraper.ts
│   ├── interfaces/             # TypeScript interfaces for contracts
│   │   ├── interfaces.ts       # Core interfaces (ICatalog, IScraper, ICatalogScraper)
│   │   ├── services.interfaces.ts # Service-specific interfaces (ISerializer, IHttpClient, IHtmlParser, IFileManager, IServiceProvider)
│   ├── services/               # Service layer for reusable utilities
│   │   ├── ServiceProvider.ts  # Service provider to manage dependencies
│   │   ├── Serializer.ts       # Handles serialization
│   │   ├── HtmlParser.ts       # Parses HTML content
│   │   ├── FileManager.ts      # Manages file operations
│   │   ├── HttpClient.ts       # Handles basic HTTP requests
│   └── utils/                  # Utility functions and helpers
│       ├── logger.ts           # Logging utility
├── package.json                # Project metadata and dependencies
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project documentation
```
</details>

## Example `data.json`
```json
[
  {
    "name": "AKCIJSKI KATALOG",
    "link": "https://www.tus.si/app/uploads/catalogues/20250324085441_13_AKCIJSKI_LETAK26.3.-1.4.2_iWtyoCN.pdf",
    "validity": "26. 03. 2025 ‐ 01. 04. 2025",
    "lastParsed": "2025-04-01T11:31:45.114Z",
    "filename": "AKCIJSKI KATALOG.pdf"
  },
  {
    "name": "AKCIJSKI KATALOG",
    "link": "https://www.tus.si/app/uploads/catalogues/20250331082428_14_AKCIJSKI_LETAK_2.4.-8.4.2_WKd8GTI.pdf",
    "validity": "02. 04. 2025 ‐ 08. 04. 2025",
    "lastParsed": "2025-04-01T11:31:51.005Z",
    "filename": "AKCIJSKI KATALOG_onep9.pdf"
  }
]
```

## How to run   
```plaintext
git remote add origin https://github.com/lsthisloss/scraperHTML_TS.git                  
npm install        
npm run dev
```

## Demo
![image](https://github.com/user-attachments/assets/da345f5e-3325-419a-8170-d828bb09e8fc)            
![image](https://github.com/user-attachments/assets/7e3a4974-2e87-4168-a2d8-a0e56ff23cc9)



