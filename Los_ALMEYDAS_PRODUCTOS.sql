-- MySQL dump 10.13  Distrib 8.0.42, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: Los_ALMEYDAS
-- ------------------------------------------------------
-- Server version	8.0.42-0ubuntu0.22.04.1

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
-- Table structure for table `PRODUCTOS`
--

DROP TABLE IF EXISTS `PRODUCTOS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PRODUCTOS` (
  `id_producto` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `precio` decimal(10,2) NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `id_categoria` int DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `imagen_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_producto`),
  KEY `id_categoria` (`id_categoria`),
  CONSTRAINT `PRODUCTOS_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `CATEGORIAS` (`id_categoria`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PRODUCTOS`
--

LOCK TABLES `PRODUCTOS` WRITE;
/*!40000 ALTER TABLE `PRODUCTOS` DISABLE KEYS */;
INSERT INTO `PRODUCTOS` VALUES (1,'Solomillo de Res','Corte premium de carne de res, ideal para asar.',35.50,50,1,'2025-05-29 23:02:37',NULL),(2,'Pechuga de Pollo','Pechugas de pollo sin hueso ni piel, frescas.',12.75,120,2,'2025-05-29 23:02:37',NULL),(3,'Salmón Fresco','Filetes de salmón fresco, ricos en Omega-3.',25.00,40,3,'2025-05-29 23:02:37',NULL),(4,'Chorizo Español','Chorizo curado estilo español, con pimentón.',8.99,80,4,'2025-05-29 23:02:37',NULL),(5,'Leche Entera','Leche pasteurizada y homogeneizada, 1 litro.',2.50,200,5,'2025-05-29 23:02:37',NULL),(6,'Pan de Masa Madre','Pan artesanal de masa madre, horneado diariamente.',4.25,60,6,'2025-05-29 23:02:37',NULL),(7,'Costillas de Cerdo','Costillas de cerdo frescas, ideales para BBQ.',18.00,70,1,'2025-05-29 23:02:37',NULL),(8,'Muslo de Pollo','Muslos de pollo con hueso, para guisos y asados.',9.50,100,2,'2025-05-29 23:02:37',NULL),(9,'Mojarra Blanca','Pescado fresco x 1000g',25.00,80,3,'2025-05-30 16:01:35','https://olimpica.vtexassets.com/arquivos/ids/711075/24018500.jpg?');
/*!40000 ALTER TABLE `PRODUCTOS` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-30 11:21:08
