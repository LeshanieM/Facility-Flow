package com.smartcampus.facility.repository;

import com.smartcampus.facility.enums.FacilityEnums.ResourceStatus;
import com.smartcampus.facility.enums.FacilityEnums.ResourceType;
import com.smartcampus.facility.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<Resource> findByType(ResourceType type);
    List<Resource> findByStatus(ResourceStatus status);

    List<Resource> findByLocation(String location);
    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);

    @Query("{ " +
           "  $and: [ " +
           "    { 'type': ?#{ [0] == null ? { $exists: true } : [0] } }, " +
           "    { 'location': ?#{ [1] == null ? { $exists: true } : [1] } }, " +
           "    { 'capacity': ?#{ [2] == null ? { $exists: true } : { $gte: [2] } } } " +
           "  ] " +
           "}")
    List<Resource> searchResources(ResourceType type, String location, Integer capacity);
}
