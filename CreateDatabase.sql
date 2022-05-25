-- phpMyAdmin SQL Dump
-- version 4.7.0
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le :  mer. 25 mai 2022 à 03:55
-- Version du serveur :  5.7.17
-- Version de PHP :  7.1.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données :  `dollexscan`
--
CREATE DATABASE IF NOT EXISTS `dollexscan` DEFAULT CHARACTER SET utf8 COLLATE utf8_bin;
USE `dollexscan`;

-- --------------------------------------------------------

--
-- Structure de la table `dollexbot`
--

CREATE TABLE `dollexbot` (
  `streamID` varchar(32) NOT NULL,
  `timestamp` time NOT NULL,
  `type` varchar(32) NOT NULL,
  `amout` int(11) NOT NULL,
  `username` varchar(32) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `messagescount`
--

CREATE TABLE `messagescount` (
  `username` varchar(32) CHARACTER SET utf8 NOT NULL,
  `streamid` varchar(32) NOT NULL,
  `count` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `streams`
--

CREATE TABLE `streams` (
  `streamID` varchar(32) NOT NULL,
  `starttimestamp` datetime NOT NULL,
  `endTimeStamp` datetime NOT NULL,
  `streamname` varchar(256) CHARACTER SET utf16 NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `dollexbot`
--
ALTER TABLE `dollexbot`
  ADD PRIMARY KEY (`streamID`,`timestamp`);

--
-- Index pour la table `messagescount`
--
ALTER TABLE `messagescount`
  ADD PRIMARY KEY (`username`,`streamid`);

--
-- Index pour la table `streams`
--
ALTER TABLE `streams`
  ADD PRIMARY KEY (`streamID`);
COMMIT;


DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `update`(IN `u` VARCHAR(32), IN `id` VARCHAR(32))
BEGIN
  DECLARE userExist INT DEFAULT 0;
    SELECT COUNT(*) INTO userExist FROM messagescount WHERE username = u;
    IF userExist = 0 THEN
        INSERT INTO messagescount VALUES(u,id,1);
    ELSE
      UPDATE messagescount SET count = count + 1 WHERE username = u AND streamid = id;
    END IF;
END$$
DELIMITER ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
