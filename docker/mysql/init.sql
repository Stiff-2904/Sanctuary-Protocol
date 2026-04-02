-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: sanctuary_protocol_db
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admission_evaluation`
--

CREATE DATABASE IF NOT EXISTS sanctuary_protocol_db;
USE `sanctuary_protocol_db`;

DROP TABLE IF EXISTS `admission_evaluation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admission_evaluation` (
  `evaluation_id` int NOT NULL AUTO_INCREMENT,
  `request_id` int DEFAULT NULL,
  `ai_result` varchar(100) DEFAULT NULL,
  `justification` text,
  `final_decision` varchar(50) DEFAULT NULL,
  `evaluation_date` date DEFAULT NULL,
  PRIMARY KEY (`evaluation_id`),
  UNIQUE KEY `request_id` (`request_id`),
  CONSTRAINT `admission_evaluation_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `admission_request` (`request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admission_evaluation`
--

LOCK TABLES `admission_evaluation` WRITE;
/*!40000 ALTER TABLE `admission_evaluation` DISABLE KEYS */;
/*!40000 ALTER TABLE `admission_evaluation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admission_request`
--

DROP TABLE IF EXISTS `admission_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admission_request` (
  `request_id` int NOT NULL AUTO_INCREMENT,
  `person_id` int DEFAULT NULL,
  `camp_id` int DEFAULT NULL,
  `request_date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `skills` text,
  PRIMARY KEY (`request_id`),
  KEY `person_id` (`person_id`),
  KEY `camp_id` (`camp_id`),
  CONSTRAINT `admission_request_ibfk_1` FOREIGN KEY (`person_id`) REFERENCES `person` (`person_id`),
  CONSTRAINT `admission_request_ibfk_2` FOREIGN KEY (`camp_id`) REFERENCES `camp` (`camp_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admission_request`
--

LOCK TABLES `admission_request` WRITE;
/*!40000 ALTER TABLE `admission_request` DISABLE KEYS */;
INSERT INTO `admission_request` VALUES (1,1,1,'2026-03-28','rejected','medic, survival'),(2,5,3,'2026-03-28','approved','basic survival'),(3,5,2,'2026-03-28','approved',NULL);
/*!40000 ALTER TABLE `admission_request` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `camp`
--

DROP TABLE IF EXISTS `camp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `camp` (
  `camp_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `location` varchar(150) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`camp_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `camp`
--

LOCK TABLES `camp` WRITE;
/*!40000 ALTER TABLE `camp` DISABLE KEYS */;
INSERT INTO `camp` VALUES (1,'Camp Alpha','Zone A','Active'),(2,'Camp Beta','Zone B','Active'),(3,'Camp Gamma','Zone C','Active');
/*!40000 ALTER TABLE `camp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `camp_request`
--

DROP TABLE IF EXISTS `camp_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `camp_request` (
  `request_id` int NOT NULL AUTO_INCREMENT,
  `source_camp_id` int DEFAULT NULL,
  `target_camp_id` int DEFAULT NULL,
  `type` varchar(20) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `request_date` date DEFAULT NULL,
  PRIMARY KEY (`request_id`),
  KEY `source_camp_id` (`source_camp_id`),
  KEY `target_camp_id` (`target_camp_id`),
  CONSTRAINT `camp_request_ibfk_1` FOREIGN KEY (`source_camp_id`) REFERENCES `camp` (`camp_id`),
  CONSTRAINT `camp_request_ibfk_2` FOREIGN KEY (`target_camp_id`) REFERENCES `camp` (`camp_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `camp_request`
--

LOCK TABLES `camp_request` WRITE;
/*!40000 ALTER TABLE `camp_request` DISABLE KEYS */;
INSERT INTO `camp_request` VALUES (1,1,2,'RESOURCE','PENDING','2026-03-26'),(2,1,2,'personnel','approved','2026-03-28'),(3,2,1,'personnel','approved','2026-03-28'),(4,2,1,'personnel','approved','2026-03-28'),(5,2,1,'personnel','approved','2026-03-28'),(6,1,2,'personnel','pending','2026-03-28'),(7,1,2,'personnel','pending','2026-03-28'),(8,1,3,'resource','approved','2026-03-28'),(9,1,3,'resource','pending','2026-03-28');
/*!40000 ALTER TABLE `camp_request` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exploration`
--

DROP TABLE IF EXISTS `exploration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exploration` (
  `exploration_id` int NOT NULL AUTO_INCREMENT,
  `camp_id` int DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`exploration_id`),
  KEY `camp_id` (`camp_id`),
  CONSTRAINT `exploration_ibfk_1` FOREIGN KEY (`camp_id`) REFERENCES `camp` (`camp_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exploration`
--

LOCK TABLES `exploration` WRITE;
/*!40000 ALTER TABLE `exploration` DISABLE KEYS */;
INSERT INTO `exploration` VALUES (1,1,'2026-03-26',NULL,'ACTIVE');
/*!40000 ALTER TABLE `exploration` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exploration_persons`
--

DROP TABLE IF EXISTS `exploration_persons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exploration_persons` (
  `exploration_id` int NOT NULL,
  `person_id` int NOT NULL,
  PRIMARY KEY (`exploration_id`,`person_id`),
  KEY `person_id` (`person_id`),
  CONSTRAINT `exploration_persons_ibfk_1` FOREIGN KEY (`exploration_id`) REFERENCES `exploration` (`exploration_id`),
  CONSTRAINT `exploration_persons_ibfk_2` FOREIGN KEY (`person_id`) REFERENCES `person` (`person_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exploration_persons`
--

LOCK TABLES `exploration_persons` WRITE;
/*!40000 ALTER TABLE `exploration_persons` DISABLE KEYS */;
INSERT INTO `exploration_persons` VALUES (1,1),(1,2);
/*!40000 ALTER TABLE `exploration_persons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exploration_resources`
--

DROP TABLE IF EXISTS `exploration_resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exploration_resources` (
  `exploration_id` int NOT NULL,
  `resource_id` int NOT NULL,
  `quantity_obtained` int DEFAULT NULL,
  PRIMARY KEY (`exploration_id`,`resource_id`),
  KEY `resource_id` (`resource_id`),
  CONSTRAINT `exploration_resources_ibfk_1` FOREIGN KEY (`exploration_id`) REFERENCES `exploration` (`exploration_id`),
  CONSTRAINT `exploration_resources_ibfk_2` FOREIGN KEY (`resource_id`) REFERENCES `resource` (`resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exploration_resources`
--

LOCK TABLES `exploration_resources` WRITE;
/*!40000 ALTER TABLE `exploration_resources` DISABLE KEYS */;
INSERT INTO `exploration_resources` VALUES (1,1,30);
/*!40000 ALTER TABLE `exploration_resources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
  `inventory_id` int NOT NULL AUTO_INCREMENT,
  `camp_id` int DEFAULT NULL,
  `resource_id` int DEFAULT NULL,
  `quantity` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`inventory_id`),
  UNIQUE KEY (`camp_id`,`resource_id`),
  KEY `resource_id` (`resource_id`),
  CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`camp_id`) REFERENCES `camp` (`camp_id`),
  CONSTRAINT `inventory_ibfk_2` FOREIGN KEY (`resource_id`) REFERENCES `resource` (`resource_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
INSERT INTO `inventory` VALUES (1,1,1,100.00),(2,1,2,50.00),(4,3,1,74.00),(6,2,1,50.00);
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `person`
--

DROP TABLE IF EXISTS `person`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `person` (
  `person_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `camp_id` int DEFAULT NULL,
  `profession_id` int DEFAULT NULL,
  PRIMARY KEY (`person_id`),
  KEY `camp_id` (`camp_id`),
  KEY `profession_id` (`profession_id`),
  CONSTRAINT `person_ibfk_1` FOREIGN KEY (`camp_id`) REFERENCES `camp` (`camp_id`),
  CONSTRAINT `person_ibfk_2` FOREIGN KEY (`profession_id`) REFERENCES `profession` (`profession_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `person`
--

LOCK TABLES `person` WRITE;
/*!40000 ALTER TABLE `person` DISABLE KEYS */;
INSERT INTO `person` VALUES (1,'Gau','active',1,3),(2,'Dani','active',1,4),(3,'Ericka','active',1,5),(4,'Angello','active',1,6),(5,'Andres','active',2,NULL),(6,'Jean Lucas','active',NULL,NULL);
/*!40000 ALTER TABLE `person` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `person_movement`
--

DROP TABLE IF EXISTS `person_movement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `person_movement` (
  `movement_id` int NOT NULL AUTO_INCREMENT,
  `person_id` int DEFAULT NULL,
  `source_camp_id` int DEFAULT NULL,
  `target_camp_id` int DEFAULT NULL,
  `movement_date` date DEFAULT NULL,
  PRIMARY KEY (`movement_id`),
  KEY `person_id` (`person_id`),
  CONSTRAINT `person_movement_ibfk_1` FOREIGN KEY (`person_id`) REFERENCES `person` (`person_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `person_movement`
--

LOCK TABLES `person_movement` WRITE;
/*!40000 ALTER TABLE `person_movement` DISABLE KEYS */;
INSERT INTO `person_movement` VALUES (1,1,1,2,'2026-03-28'),(2,1,2,1,'2026-03-28');
/*!40000 ALTER TABLE `person_movement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `profession`
--

DROP TABLE IF EXISTS `profession`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profession` (
  `profession_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`profession_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profession`
--

LOCK TABLES `profession` WRITE;
/*!40000 ALTER TABLE `profession` DISABLE KEYS */;
INSERT INTO `profession` VALUES (3,'Water Carrier','Responsible for collecting and transporting WATER'),(4,'Forager','Gathers food and basic survival resources'),(5,'Healer','Responsible for treating injuries and maintaining health'),(6,'Explorer','Explores external areas for resources and information');
/*!40000 ALTER TABLE `profession` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `request_person`
--

DROP TABLE IF EXISTS `request_person`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `request_person` (
  `request_id` int NOT NULL,
  `profession_id` int NOT NULL,
  `quantity` int DEFAULT NULL,
  PRIMARY KEY (`request_id`,`profession_id`),
  KEY `profession_id` (`profession_id`),
  CONSTRAINT `request_person_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `camp_request` (`request_id`),
  CONSTRAINT `request_person_ibfk_2` FOREIGN KEY (`profession_id`) REFERENCES `profession` (`profession_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `request_person`
--

LOCK TABLES `request_person` WRITE;
/*!40000 ALTER TABLE `request_person` DISABLE KEYS */;
INSERT INTO `request_person` VALUES (2,4,1),(5,3,1),(7,3,1);
/*!40000 ALTER TABLE `request_person` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `request_resource`
--

DROP TABLE IF EXISTS `request_resource`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `request_resource` (
  `request_id` int NOT NULL,
  `resource_id` int NOT NULL,
  `quantity` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`request_id`,`resource_id`),
  KEY `resource_id` (`resource_id`),
  CONSTRAINT `request_resource_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `camp_request` (`request_id`),
  CONSTRAINT `request_resource_ibfk_2` FOREIGN KEY (`resource_id`) REFERENCES `resource` (`resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `request_resource`
--

LOCK TABLES `request_resource` WRITE;
/*!40000 ALTER TABLE `request_resource` DISABLE KEYS */;
INSERT INTO `request_resource` VALUES (1,1,20.00),(8,1,2.50),(9,1,2.50);
/*!40000 ALTER TABLE `request_resource` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resource`
--

DROP TABLE IF EXISTS `resource`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resource` (
  `resource_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`resource_id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `name_2` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resource`
--

LOCK TABLES `resource` WRITE;
/*!40000 ALTER TABLE `resource` DISABLE KEYS */;
INSERT INTO `resource` VALUES (2,'Rice'),(1,'Water');
/*!40000 ALTER TABLE `resource` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resource_movement`
--

DROP TABLE IF EXISTS `resource_movement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resource_movement` (
  `movement_id` int NOT NULL AUTO_INCREMENT,
  `resource_id` int DEFAULT NULL,
  `source_camp_id` int DEFAULT NULL,
  `target_camp_id` int DEFAULT NULL,
  `quantity` decimal(10,2) DEFAULT NULL,
  `movement_date` date DEFAULT NULL,
  PRIMARY KEY (`movement_id`),
  KEY `resource_id` (`resource_id`),
  CONSTRAINT `resource_movement_ibfk_1` FOREIGN KEY (`resource_id`) REFERENCES `resource` (`resource_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resource_movement`
--

LOCK TABLES `resource_movement` WRITE;
/*!40000 ALTER TABLE `resource_movement` DISABLE KEYS */;
INSERT INTO `resource_movement` VALUES (1,1,1,3,2.50,'2026-03-28');
/*!40000 ALTER TABLE `resource_movement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resource_production`
--

DROP TABLE IF EXISTS `resource_production`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resource_production` (
  `production_id` int NOT NULL AUTO_INCREMENT,
  `person_id` int DEFAULT NULL,
  `resource_id` int DEFAULT NULL,
  `quantity_produced` int DEFAULT NULL,
  `production_date` date DEFAULT NULL,
  PRIMARY KEY (`production_id`),
  KEY `person_id` (`person_id`),
  KEY `resource_id` (`resource_id`),
  CONSTRAINT `resource_production_ibfk_1` FOREIGN KEY (`person_id`) REFERENCES `person` (`person_id`),
  CONSTRAINT `resource_production_ibfk_2` FOREIGN KEY (`resource_id`) REFERENCES `resource` (`resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resource_production`
--

LOCK TABLES `resource_production` WRITE;
/*!40000 ALTER TABLE `resource_production` DISABLE KEYS */;
/*!40000 ALTER TABLE `resource_production` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_role`
--

DROP TABLE IF EXISTS `system_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_role` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_role`
--

LOCK TABLES `system_role` WRITE;
/*!40000 ALTER TABLE `system_role` DISABLE KEYS */;
INSERT INTO `system_role` VALUES (1,'Admin','Manages admissions within assigned camp'),(2,'Worker','Limited inventory access within assigned camp'),(3,'ResourceManager','Manages inventory and resources within assigned camp'),(4,'ExpeditionManager','Handles camp requests, logistics and communication'),(5,'SuperAdmin','Full system access across all camps');
/*!40000 ALTER TABLE `system_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_account`
--

DROP TABLE IF EXISTS `user_account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_account` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `person_id` int DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `person_id` (`person_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_account_ibfk_1` FOREIGN KEY (`person_id`) REFERENCES `person` (`person_id`),
  CONSTRAINT `user_account_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `system_role` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_account`
--

LOCK TABLES `user_account` WRITE;
/*!40000 ALTER TABLE `user_account` DISABLE KEYS */;
INSERT INTO `user_account` VALUES (1,'lhorean','$2b$10$AyRtUgkEbvK/6oj3eWNd3u5v3piVA2R3JyJfiDto7uBoOB.Xosx1u',NULL,5),(2,'Dani00','$2b$10$aDBGPw3.jQs2rc422gaedOB9i4d4cu4iTDEYuzQgq31L6mH9XNHoC',2,2);
/*!40000 ALTER TABLE `user_account` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-31 18:54:16
