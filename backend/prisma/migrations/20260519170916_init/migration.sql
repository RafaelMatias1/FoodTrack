-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `senhaHash` VARCHAR(191) NOT NULL,
    `nomeFoodTruck` VARCHAR(191) NOT NULL,
    `nomeProprietario` VARCHAR(191) NOT NULL,
    `cidade` VARCHAR(191) NOT NULL,
    `codigoQuiosque` VARCHAR(191) NOT NULL DEFAULT '0000',
    `corPrimaria` VARCHAR(191) NOT NULL DEFAULT '#e07b20',
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Produto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `categoria` VARCHAR(191) NOT NULL,
    `preco` DOUBLE NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `estoqueAtual` INTEGER NOT NULL DEFAULT 0,
    `estoqueMinimo` INTEGER NOT NULL DEFAULT 0,
    `descricao` VARCHAR(191) NULL,
    `imagemEmoji` VARCHAR(191) NULL,
    `imagemUrl` VARCHAR(191) NULL,
    `personalizacoes` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `contato` VARCHAR(191) NULL,
    `totalPedidos` INTEGER NOT NULL DEFAULT 0,
    `totalGasto` DOUBLE NOT NULL DEFAULT 0,
    `ultimoPedido` DATETIME(3) NULL,
    `preferencia` VARCHAR(191) NULL,
    `tipo` VARCHAR(191) NOT NULL DEFAULT 'novo',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pedido` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `clienteNome` VARCHAR(191) NULL,
    `clienteId` INTEGER NULL,
    `origem` VARCHAR(191) NOT NULL,
    `total` DOUBLE NOT NULL,
    `formaPagamento` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Em preparo',
    `observacoes` VARCHAR(191) NULL,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ItemPedido` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pedidoId` INTEGER NOT NULL,
    `produtoId` INTEGER NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `precoUnit` DOUBLE NOT NULL,
    `subtotal` DOUBLE NOT NULL,
    `observacao` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Produto` ADD CONSTRAINT `Produto_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cliente` ADD CONSTRAINT `Cliente_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pedido` ADD CONSTRAINT `Pedido_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pedido` ADD CONSTRAINT `Pedido_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemPedido` ADD CONSTRAINT `ItemPedido_pedidoId_fkey` FOREIGN KEY (`pedidoId`) REFERENCES `Pedido`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemPedido` ADD CONSTRAINT `ItemPedido_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `Produto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
