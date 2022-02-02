import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as config from 'config';

const dbConfig = config.get('db')
export const typeORMConfig : TypeOrmModuleOptions = {
    type: dbConfig.type,
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    // 엔티티를 이용해서 DB 테이블 생성해주므로 엔티티 파일이 어디에 있는지 설정해줌
    synchronize: dbConfig.synchronize
    // 애플리케이션을 다시 실행할 때 엔티티 안에서 수정된 컬럼의 길이, 타입, 변경값들을
    // 해당 테이블을 drop한 후 다시 생성해준다.
}